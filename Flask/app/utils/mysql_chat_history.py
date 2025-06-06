import contextlib
import json
import logging
from abc import ABC, abstractmethod
from typing import (
    Any,
    AsyncGenerator,
    Dict,
    Generator,
    List,
    Optional,
    Sequence,
    Union,
    cast,
)

from langchain_core._api import deprecated, warn_deprecated
from sqlalchemy import Column, Integer, Text, delete, select,JSON,DateTime, func

try:
    from sqlalchemy.orm import declarative_base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import (
    BaseMessage,
    message_to_dict,
    messages_from_dict,
)
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import (
    Session as SQLSession,
)
from sqlalchemy.orm import (
    declarative_base,
    scoped_session,
    sessionmaker,
)

try:
    from sqlalchemy.ext.asyncio import async_sessionmaker
except ImportError:
    # dummy for sqlalchemy < 2
    async_sessionmaker = type("async_sessionmaker", (type,), {})  # type: ignore

logger = logging.getLogger(__name__)


class BaseMessageConverter(ABC):
    """Convert BaseMessage to the SQLAlchemy model."""

    @abstractmethod
    def from_sql_model(self, sql_message: Any) -> BaseMessage:
        """Convert a SQLAlchemy model to a BaseMessage instance."""
        raise NotImplementedError

    @abstractmethod
    def to_sql_model(self, message: BaseMessage, conversation_id: str,user_id:int) -> Any:
        """Convert a BaseMessage instance to a SQLAlchemy model."""
        raise NotImplementedError

    @abstractmethod
    def get_sql_model_class(self) -> Any:
        """Get the SQLAlchemy model class."""
        raise NotImplementedError


def create_message_model(table_name: str, DynamicBase: Any) -> Any:
    """
    Create a message model for a given table name.

    Args:
        table_name: The name of the table to use.
        DynamicBase: The base class to use for the model.

    Returns:
        The model class.

    """

  # Model declared inside a function to have a dynamic table name.
    class Message(DynamicBase):
        __tablename__ = table_name
        id = Column(Integer, primary_key=True)
        conversation_id = Column(Text)
        user_id = Column(Integer)
        history = Column(JSON)  # Adding the 'history' column for JSON data
        created_at = Column(DateTime, default=func.now())  # Set on creation
        updated_at = Column(DateTime, default=func.now(), onupdate=func.now())  # Auto-update on change
        
    return Message

class DefaultMessageConverter(BaseMessageConverter):
    """The default message converter for SQLChatMessageHistory."""

    def __init__(self, table_name: str):
        self.model_class = create_message_model(table_name, declarative_base())

    def from_sql_model(self, sql_message: Any) -> BaseMessage:
        return messages_from_dict([json.loads(sql_message.history)])[0]

    def to_sql_model(self, message: BaseMessage, conversation_id: str, user_id: int) -> Any:
        return self.model_class(
            conversation_id=conversation_id,
            user_id=user_id,
            history=json.dumps(message_to_dict(message)),  # Storing the message history in JSON format
        )

    def get_sql_model_class(self) -> Any:
        return self.model_class

DBConnection = Union[AsyncEngine, Engine, str]

_warned_once_already = False


class SQLChatMessageHistory(BaseChatMessageHistory):
    """Chat message history stored in an SQL database."""

    @property
    @deprecated("0.2.2", removal="1.0", alternative="session_maker")
    def Session(self) -> Union[scoped_session, async_sessionmaker]:
        return self.session_maker

    def __init__(
        self,
        conversation_id: str,
        user_id: int,
        connection_string: Optional[str] = None,
        table_name: str = "messages",
        conversation_id_field_name: str = "conversation_id",
        user_id_field_name: str = "user_id",
        custom_message_converter: Optional[BaseMessageConverter] = None,
        connection: Union[None, DBConnection] = None,
        engine_args: Optional[Dict[str, Any]] = None,
        async_mode: Optional[bool] = None,  # Use only if connection is a string
    ):
        """Initialize with a SQLChatMessageHistory instance."""
        assert not (
            connection_string and connection
        ), "connection_string and connection are mutually exclusive"
        if connection_string:
            global _warned_once_already
            if not _warned_once_already:
                warn_deprecated(
                    since="0.2.2",
                    removal="1.0",
                    name="connection_string",
                    alternative="connection",
                )
                _warned_once_already = True
            connection = connection_string
            self.connection_string = connection_string
        if isinstance(connection, str):
            self.async_mode = async_mode
            if async_mode:
                # Use asyncmy or aiomysql with create_async_engine
                self.async_engine = create_async_engine(connection, **(engine_args or {}))
            else:
                self.engine = create_engine(url=connection, **(engine_args or {}))
        elif isinstance(connection, Engine):
            self.async_mode = False
            self.engine = connection
        elif isinstance(connection, AsyncEngine):
            self.async_mode = True
            self.async_engine = connection
        else:
            raise ValueError(
                "connection should be a connection string or an instance of "
                "sqlalchemy.engine.Engine or sqlalchemy.ext.asyncio.engine.AsyncEngine"
            )

        self.session_maker: Union[scoped_session, async_sessionmaker]
        if self.async_mode:
            self.session_maker = async_sessionmaker(bind=self.async_engine)
        else:
            self.session_maker = scoped_session(sessionmaker(bind=self.engine))

        self.conversation_id_field_name = conversation_id_field_name
        self.user_id_field_name = user_id_field_name
        self.converter = custom_message_converter or DefaultMessageConverter(table_name)
        self.sql_model_class = self.converter.get_sql_model_class()
        if not hasattr(self.sql_model_class, conversation_id_field_name):
            raise ValueError("SQL model class must have conversation_id column")
        if not hasattr(self.sql_model_class, user_id_field_name):
            raise ValueError("SQL model class must have user_id column")
        self._table_created = False
        if not self.async_mode:
            self._create_table_if_not_exists()

        self.conversation_id = conversation_id
        self.user_id = user_id

    def _create_table_if_not_exists(self) -> None:
        self.sql_model_class.metadata.create_all(self.engine)
        self._table_created = True

    async def _acreate_table_if_not_exists(self) -> None:
        if not self._table_created:
            assert self.async_mode, "This method must be called with async_mode"
            async with self.async_engine.begin() as conn:
                await conn.run_sync(self.sql_model_class.metadata.create_all)
            self._table_created = True

    @property
    def messages(self) -> List[BaseMessage]:  # type: ignore
        """Retrieve all messages from db"""
        with self._make_sync_session() as session:
            result = (
                session.query(self.sql_model_class)
                .where(
                    getattr(self.sql_model_class, self.conversation_id_field_name)
                    == self.conversation_id
                )
                .order_by(self.sql_model_class.created_at.asc())
            )
            messages = []
            for record in result:
                messages.append(self.converter.from_sql_model(record))
            return messages

    def get_messages(self) -> List[BaseMessage]:
        return self.messages

    async def aget_messages(self) -> List[BaseMessage]:
        """Retrieve all messages from db"""
        await self._acreate_table_if_not_exists()
        async with self._make_async_session() as session:
            stmt = (
                select(self.sql_model_class)
                .where(
                    getattr(self.sql_model_class, self.conversation_id_field_name)
                    == self.conversation_id
                )
                .order_by(self.sql_model_class.created_at.asc())
            )
            result = await session.execute(stmt)
            messages = []
            for record in result.scalars():
                messages.append(self.converter.from_sql_model(record))
            return messages

    def add_message(self, message: BaseMessage) -> None:
        """Append the message to the record in db"""
        with self._make_sync_session() as session:
            session.add(self.converter.to_sql_model(message, self.conversation_id,self.user_id))
            session.commit()

    async def aadd_message(self, message: BaseMessage) -> None:
        """Add a Message object to the store."""
        await self._acreate_table_if_not_exists()
        async with self._make_async_session() as session:
            session.add(self.converter.to_sql_model(message, self.conversation_id,self.user_id))
            await session.commit()

    def add_messages(self, messages: Sequence[BaseMessage]) -> None:
        """Add all messages in one transaction"""
        with self._make_sync_session() as session:
            for message in messages:
                session.add(self.converter.to_sql_model(message, self.conversation_id,self.user_id))
            session.commit()

    async def aadd_messages(self, messages: Sequence[BaseMessage]) -> None:
        """Add all messages in one transaction"""
        await self._acreate_table_if_not_exists()
        async with self.session_maker() as session:
            for message in messages:
                session.add(self.converter.to_sql_model(message, self.conversation_id,self.user_id))
            await session.commit()

    def clear(self) -> None:
        """Clear session memory from db"""
        with self._make_sync_session() as session:
            session.query(self.sql_model_class).filter(
                getattr(self.sql_model_class, self.conversation_id_field_name)
                == self.conversation_id
            ).delete()
            session.commit()

    async def aclear(self) -> None:
        """Clear session memory from db"""
        await self._acreate_table_if_not_exists()
        async with self._make_async_session() as session:
            stmt = delete(self.sql_model_class).filter(
                getattr(self.sql_model_class, self.conversation_id_field_name)
                == self.conversation_id
            )
            await session.execute(stmt)
            await session.commit()

    @contextlib.contextmanager
    def _make_sync_session(self) -> Generator[SQLSession, None, None]:
        """Make a sync session."""
        if self.async_mode:
            raise ValueError(
                "Attempting to use a sync method when async mode is turned on. "
                "Please use the corresponding async method instead."
            )
        with self.session_maker() as session:
            yield cast(SQLSession, session)

    @contextlib.asynccontextmanager
    async def _make_async_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Make an async session."""
        if not self.async_mode:
            raise ValueError(
                "Attempting to use an async method when sync mode is turned on. "
                "Please use the corresponding async method instead."
            )
        async with self.session_maker() as session:
            yield cast(AsyncSession, session)