from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_chroma import Chroma
from utils.mongodbdbytestore import MongoDBByteStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.retrievers.multi_vector import MultiVectorRetriever
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.schema.document import Document
from langchain_core.prompts import MessagesPlaceholder,ChatPromptTemplate
from langchain_core.messages import AIMessage,HumanMessage
from langchain_core.runnables import RunnableLambda
import os
from langchain_core.runnables.history import RunnableWithMessageHistory
from utils.mysql_chat_history import SQLChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.utils import ConfigurableFieldSpec
from utils.helper_functions import get_retriever,get_llm
class ChatService:
    def __init__(self):
           self._llm = get_llm()
    
    def ask(self,message,course,conversation_id,user_id):
        chain = self._make_template(course)
            
        result = chain.invoke({"input":message},config={"configurable":{"user_id":user_id,"conversation_id":conversation_id}}) 
    
        return result['answer']
       

    def _make_template(self,course):
        contextualize_q_system_prompt = (
            "Given a chat history and the latest user question, "
            "which may reference prior context, reformulate the question into a standalone version "
            "that can be understood without the chat history. Do NOT answer the question.\n\n"

            "If the question includes a task such as generating examples, practice problems, or summaries, "
            "make sure the reformulated version includes any relevant topics or concepts clearly so that "
            "the retriever can fetch the appropriate course content.\n\n"

            "Only reformulate if necessary. If the original question is already clear and complete, return it as is.\n\n"
        )
        contextualize_q_prompt = ChatPromptTemplate.from_messages(
                    [
                    ("system",contextualize_q_system_prompt),
                    MessagesPlaceholder("history"),
                    ("human","{input}")
                ]
                )

        history_aware_retriever= create_history_aware_retriever(
            self._llm,
            get_retriever(course=course),
            contextualize_q_prompt
            )
        retriever_with_conversion = history_aware_retriever | RunnableLambda(ChatService._convert_to_documents)

        qa_system_prompt = (
        "You are a professional course assistant, designed to help students and instructors understand the course material. "
        "You should answer questions based **strictly on the provided course content** and any directly related concepts explicitly mentioned within it. "
        "Refer to the provided material as 'course content' instead of 'context.'\n\n"
        "Respond in your own words unless asked to reply exactly as in the context."

        "**If a question is explicitly covered in the course content:** Answer it clearly and concisely. If solving steps, explanations, or methodologies are given, follow them closely.\n\n"
        
        "**If a question is not explicitly covered but builds upon a concept in the course content:** Explain it only if the course material explicitly introduces the concept. Ensure that your response remains within the boundaries of the course material, using only relevant examples and explanations.\n\n"
        
        "**If a question is entirely outside the scope of the course content and doesn't build upon a concept in the course content, even if it belongs to a broader field related to the course:** Politely respond with: "
        "'The course content does not cover this topic.' Do not attempt to answer questions that go beyond the explicitly mentioned topics.\n\n"
        
        "**Formatting:**\n"
        "- Use **LaTeX in Markdown** for mathematical, scientific, or technical expressions (`$...$` for inline math, `$$...$$` for block math).\n"
        "- Format responses in Markdown (bold, italics, lists, etc.) while keeping the language natural and engaging.\n\n"
        
        "**Tone:** Maintain a warm, professional, and engaging tone. Use emojis where appropriate to keep the conversation engaging and clear!\n\n"
        
        "{context}"
        )





        qa_prompt = ChatPromptTemplate.from_messages([
            ("system",qa_system_prompt),
            MessagesPlaceholder("history"),
            ("human","{input}")
        ])

        question_answer_chain = create_stuff_documents_chain(self._llm,qa_prompt)


        rag_chain = create_retrieval_chain(
            retriever_with_conversion,
            question_answer_chain,
            )
        chain = RunnableWithMessageHistory(rag_chain, 
                                   lambda user_id,conversation_id: SQLChatMessageHistory(
                                    user_id=user_id,
                                    conversation_id=conversation_id,
                                    connection="mysql://root@localhost/teachwiseai"
                                ),
                                   history_messages_key="history",
                                    output_messages_key="answer",
                                    history_factory_config=[
                                        ConfigurableFieldSpec(
                                            id="user_id",
                                            annotation=str,
                                            name="User ID",
                                            description="Unique identifier for the user.",
                                            default="",
                                            is_shared=False,
                                        ),
                                        ConfigurableFieldSpec(
                                            id="conversation_id",
                                            annotation=str,
                                            name="Conversation ID",
                                            description="Unique identifier for the conversation.",
                                            default="",
                                            is_shared=False,
                                        ),
                                    ],
                                   )
        return chain
          
    
    @staticmethod
    def _convert_to_documents(docs):
        original_document_objects = []
        for doc in docs:
            if doc is None:
                continue    
            if "text" in doc['file_type']:
                combined_content = ""
                for element in doc['element'].metadata.orig_elements:
                    if "Table" not in str(type(element)) or "Image" not in str(type(element)): 
                        combined_content += element.text
                original_document_objects.append(Document(combined_content))  
            # display_chunk_pages(doc['element'])
            elif "image" in doc['file_type']:
                original_document_objects.append(Document(doc['summary']))  
                #display_base64_image(doc['element'])
            else:
                original_document_objects.append(Document(doc['element']))   
        return original_document_objects


"""   "**Formatting:**\n"
        "- Use **LaTeX in Markdown** for mathematical, scientific, or technical expressions (`$...$` for inline math, `$$...$$` for block math).\n"
        "- Format responses in Markdown (bold, italics, lists, etc.) while keeping the language natural and engaging.\n\n" """