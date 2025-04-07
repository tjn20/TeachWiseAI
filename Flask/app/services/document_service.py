from unstructured.partition.pdf import partition_pdf
import os
from langchain_core.prompts import ChatPromptTemplate,MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from utils.helper_functions import get_llm,get_multimodal_llm,get_retriever,get_vectorDB
from langchain.schema.document import Document
from utils.mongodbdbytestore import MongoDBByteStore
from langchain_chroma import Chroma
import time
def partition_file(*,path,file_type):
    current_dir = os.getcwd()
    file_path = os.path.join(current_dir,os.getenv("BASE_DIR"),path)
    chunks = None
    if file_type == "application/pdf":
        chunks = partition_pdf(
        filename=file_path,
        infer_table_structure=True,
        strategy="hi_res",
        extract_image_block_types=["Image"],
        extract_image_block_to_payload=True, 
        chunking_strategy="by_title",
        max_characters=10000,
        combine_text_under_n_chars=2000,
        new_after_n_chars=6000 
        ) 
    else: 
        chunks = ""

    return chunk_file(chunks)    


def chunk_file(chunks):
    tables = []
    texts = [] 
    images = []
    for chunk in chunks:
        if "CompositeElement" in str(type(chunk)):
            chunk_els = chunk.metadata.orig_elements
            texts.append(chunk)
            for el in chunk_els:
                  if "Table" in str(type(el)):
                    tables.append(el.metadata.text_as_html)
                  if "Image" in str(type(el)):
                    images.append(el.metadata.image_base64)
                    
    return texts,tables,images        


def summarize_chunk(*,texts,tables,images):
    texts_and_tables_prompt_template = """
    You are an assistant tasked with summarizing tables and text.
    Give a concise summary of the table or text.

    Respond only with the summary, no additionnal comment.
    Do not start your message by saying "Here is a summary" or anything like that.
    Just give the summary as it is.

    Table or text chunk: {element}

    """ 
    texts_and_tables_prompt = ChatPromptTemplate.from_template(texts_and_tables_prompt_template)
    
    summarize_chain = texts_and_tables_prompt | get_llm() | StrOutputParser()

    images_prompt_template = """Describe the image in detail.Be specific about graphs, such as bar plots. 
                                Do not start your message by saying "Here is a summary" or anything like that.
                                Just give the summary as it is.
                            """
    images_messages = [
    (
        "user",
        [
            {"type": "text", "text": images_prompt_template},
            {
                "type": "image_url",
                "image_url": {"url": "data:image/jpeg;base64,{image}"},
            },
        ],
    )
    ]

    images_prompt = ChatPromptTemplate.from_messages(images_messages)

    images_summarization_chain = images_prompt | get_multimodal_llm() | StrOutputParser()

    text_summaries = []
    tables_summaries = []
    images_summaries = []

    if len(texts) > 0:
        text_summaries = summarize_chain.batch(texts,{
            "max_concurrency": 3
        })
    if len(tables) > 0:
        tables_summaries = summarize_chain.batch(tables,{
            "max_concurrency": 3
        })
    if len(images) > 0:
        retry_attempts = 0
        wait_time = 2
        current_wait = wait_time  
        for i,image in enumerate(images):
            while retry_attempts < 4:
                try:
                    images_summaries.append( images_summarization_chain.invoke(image))
                    time.sleep(wait_time)
                    break;
                except Exception as e:
                    if "rate limit" in str(e).lower():
                        print(f"Rate limit exceeded. Retrying in {wait_time} seconds...")
                        time.sleep(wait_time)
                        current_wait *= 2  
                        retry_attempts += 1
                    else:
                        raise
            if retry_attempts == 4:
                continue        

   

    return text_summaries,tables_summaries,images_summaries    


def add_to_vectorDB(*,texts,tables,images,course,text_summaries,table_summaries,images_summaries,file_id):
    retriever = get_retriever(course=course)
    if len(texts) > 0:
        texts_summaries_documents = [
            Document(page_content=summary, metadata={'file_id': file_id, 'doc_id': str(doc_id)})
            for summary, doc_id in zip(
            text_summaries,
            retriever.docstore.mset(list(zip(texts, [file_id] * len(texts),["text"]*len(texts),[None]*len(texts)))))
        ]
        retriever.vectorstore.add_documents(texts_summaries_documents)    


    if len(tables) > 0:
        table_summaries_documents = [
            Document(page_content=summary, metadata={'file_id': file_id, 'doc_id': str(doc_id)})
            for summary, doc_id in zip(
            table_summaries,
            retriever.docstore.mset(list(zip(tables, [file_id] * len(tables),["table"]*len(tables),[None]*len(tables)))))
        ]
        retriever.vectorstore.add_documents(table_summaries_documents)  


    if len(images) > 0:
        images_summaries_documents = [
            Document(page_content=summary, metadata={'file_id': file_id, 'doc_id': str(doc_id)})
            for summary, doc_id in zip(
            images_summaries,
            retriever.docstore.mset(list(zip(images, [file_id] * len(images),["image"]*len(images),images_summaries))))
        ]
        retriever.vectorstore.add_documents(images_summaries_documents)  
              

def remove_course_files_from_vectorDB(*,file_ids,course):
    vector_db,mongodb_store = get_vectorDB(course=course)
    for file_id in file_ids:
        chunks_ids_to_delete = [str(result['_id']) for result in mongodb_store.getIds(file_id)]
        if len(chunks_ids_to_delete) < 1:
            return
        vector_db.delete(chunks_ids_to_delete) 
        mongodb_store.mdelete(chunks_ids_to_delete)


def remove_course_from_vectorDB(*,course):
    MongoDBByteStore.delete_collection(
    mongo_db_connection=os.getenv("MONGODB_CONNECTION_HOST","mongodb://localhost:27018/"), # to fix later
    db_name="rag_system", 
    collection_name=course
    )
    vector = Chroma(persist_directory="db")
    if course in vector._client.list_collections():
        vector._client.delete_collection(course)

def process_files(*,files,course):
    for file in files:
        texts,tables,images = partition_file(path=file['path'],file_type=file['mime'])
        text_summaries,tables_summaries,images_summaries = summarize_chunk (texts=texts,tables=tables,images=images)
        add_to_vectorDB(course=course,texts=texts,images=images,tables=tables,table_summaries=tables_summaries,images_summaries=images_summaries,text_summaries=text_summaries,file_id=file['id'])