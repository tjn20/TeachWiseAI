from typing import Iterator, List, Optional, Sequence, Tuple

from langchain_core.documents import Document
from langchain_core.stores import BaseStore
from pickle import dumps,loads
from unstructured.documents.elements import CompositeElement
from pymongo import MongoClient
from bson import ObjectId


class MongoDBByteStore(BaseStore[str, bytes]):
    """BaseStore implementation using MongoDB as the underlying store.

    Examples:
        Create a MongoDBByteStore instance and perform operations on it:

        .. code-block:: python

            # Instantiate the MongoDBByteStore with a MongoDB connection
            from langchain.storage import MongoDBByteStore

            mongo_conn_str = "mongodb://localhost:27017/"
            mongodb_store = MongoDBBytesStore(mongo_conn_str, db_name="test-db",
                                         collection_name="test-collection")

            # Set values for keys
            mongodb_store.mset([("key1", "hello"), ("key2", "workd")])

            # Get values for keys
            values = mongodb_store.mget(["key1", "key2"])
            # [bytes1, bytes1]

            # Iterate over keys
            for key in mongodb_store.yield_keys():
                print(key)

            # Delete keys
            mongodb_store.mdelete(["key1", "key2"])
    """

    def __init__(
        self,
        connection_string: str,
        db_name: str,
        collection_name: str,
        *,
        client_kwargs: Optional[dict] = None,
    ) -> None:
        """Initialize the MongoDBStore with a MongoDB connection string.

        Args:
            connection_string (str): MongoDB connection string
            db_name (str): name to use
            collection_name (str): collection name to use
            client_kwargs (dict): Keyword arguments to pass to the Mongo client
        """
        try:
            from pymongo import MongoClient
        except ImportError as e:
            raise ImportError(
                "The MongoDBStore requires the pymongo library to be "
                "installed. "
                "pip install pymongo"
            ) from e

        if not connection_string:
            raise ValueError("connection_string must be provided.")
        if not db_name:
            raise ValueError("db_name must be provided.")
        if not collection_name:
            raise ValueError("collection_name must be provided.")

        self.client: MongoClient = MongoClient(
            connection_string, **(client_kwargs or {})
        )
        self.collection = self.client[db_name][collection_name]


    def mget(self, keys: Sequence[str]) -> List[Optional[bytes]]:
        """Get the list of documents associated with the given keys.

        Args:
            keys (list[str]): A list of keys representing Document IDs..

        Returns:
            list[Document]: A list of Documents corresponding to the provided
                keys, where each Document is either retrieved successfully or
                represented as None if not found.
        """
        keys = [ObjectId(key) for key in keys]
        result = self.collection.find({"_id": {"$in": keys}})
        result_dict = {doc["_id"]: {
                                    "element":doc["element"],
                                    "file_type":doc["file_type"],
                                    **({"summary": doc.get('summary')} if doc.get('summary') is not None else {})
                                    } for doc in result}

        elements = []
        for key,content in result_dict.items():
            element = self._deserialize_document(content['element'],content['file_type'])
            content['element'] = element     
            elements.append(content)        
        return elements


    def mset(self, key_value_pairs: Sequence[Tuple[bytes,int,str,Optional[str]]]) -> None:
        """Set the given key-value pairs.

        Args:
            key_value_pairs (list[tuple[str, Document]]): A list of id-document
                pairs.
        """
        inserts  = [
        {
            "element": dumps(v) if isinstance(v, CompositeElement) else v,  # Serialize CompositeElement
            "file_id": file_id,  # Add file_id to the update
            "file_type":file_type,
            **({"summary": image_summary} if image_summary is not None else {})
        }
        for v, file_id,file_type,image_summary in key_value_pairs  # Unpack the tuple to get key, value, and file_id
        ]
        return self.collection.insert_many(inserts).inserted_ids



    def mdelete(self, keys: Sequence[str]) -> None:
        """Delete the given ids.

        Args:
            keys (list[str]): A list of keys representing Document IDs..
        """
        keys = [ObjectId(key) for key in keys]
        self.collection.delete_many({"_id": {"$in": keys}})


    def yield_keys(self, prefix: Optional[str] = None) -> Iterator[str]:
        """Yield keys in the store.

        Args:
            prefix (str): prefix of keys to retrieve.
        """
        if prefix is None:
            for doc in self.collection.find(projection=["_id"]):
                yield doc["_id"]
        else:
            for doc in self.collection.find(
                {"_id": {"$regex": f"^{prefix}"}}, projection=["_id"]
            ):
                yield doc["_id"]

    def _deserialize_document(self, serialized_data: Optional[bytes],file_type:str) -> Optional[CompositeElement]:
        if serialized_data is None:
            return None
        if "text" == file_type:
            return loads(serialized_data)  # Deserialize if it's a pickled object
        else: 
            return serialized_data

    def getIds(self,file_id:str) -> List[str]:
        return self.collection.find({"file_id":file_id},{"_id":True})   

    @classmethod
    def delete_collection(cls, mongo_db_connection: str, db_name: str, collection_name: str) -> None:
        """Delete the collection from MongoDB."""
        client = MongoClient(mongo_db_connection)
        db = client[db_name]
        
        # Drop the collection
        if collection_name in db.list_collection_names():
            db.drop_collection(collection_name)
            print(f"Collection '{collection_name}' has been deleted.")
        else:
            print(f"Collection '{collection_name}' does not exist.")