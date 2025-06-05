from langchain_chroma import Chroma
from utils.mongodbdbytestore import MongoDBByteStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.retrievers.multi_vector import MultiVectorRetriever
import os
from langchain_openai import ChatOpenAI
def get_vectorDB(*,course):
    target_folder = os.path.join(os.path.dirname(__file__), "..", 'db')
    DB_PATH = os.path.abspath(target_folder)
    vector_db = Chroma(persist_directory=DB_PATH,embedding_function=HuggingFaceEmbeddings(model_name="all-mpnet-base-v2"),collection_name=course)
    mongodb_store = MongoDBByteStore(os.getenv("MONGODB_CONNECTION_HOST","mongodb://localhost:27018/"), db_name="rag_system",collection_name=course)
    return vector_db,mongodb_store    

def get_retriever(*,course):
        course=course
        vector_db,mongodb_store = get_vectorDB(course=course)
        return MultiVectorRetriever(
        vectorstore=vector_db,
        docstore=mongodb_store,
        id_key="doc_id",
        search_kwargs={"k":5,"lambda":0.4},
        search_type="mmr",
        )   

def get_llm():
    return ChatOpenAI(temperature=0.5, model="gpt-4o-mini",max_tokens=6000)


def get_multimodal_llm():
    return ChatOpenAI(temperature=0.5, model="gpt-4o-mini",max_tokens=6000)
