
import MessageItem from "@/components/app/MessageItem"
import MessageInput from "@/components/app/MessageInput"
import { useCallback, useEffect, useRef, useState } from "react"
import axiosClient from "../axios"
import { useNavigate, useParams } from "react-router-dom"
import {v4 as uuid} from "uuid"
import { SidebarProvider,SidebarTrigger,SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app/AppSideBar"
import { Separator } from "@/components/ui/separator"
import echo from "../echo.js"
import { Loader } from "lucide-react"
import { toast } from "sonner"

export default function Chat({
    conversationId,
    messages : conversationMessages,
    nextCursor : InitialNextCursor,
    handleSessionTimeOut
}) {
    const [messages,setMessages] = useState([])
    const [isMessageSending, setIsMessageSending] = useState(false)
    const [isMessageAdded,setIsMessageAdded] = useState(false)
    const {navigate} = useNavigate()
    const lastMessageRef = useRef(null);
    const aiLoadingMessageIdRef = useRef(null);;
    const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
    const [nextCursor, setNextCursor] = useState(InitialNextCursor);
    const messagesContainerRef = useRef(null)
    const loadMoreIntersect = useRef(null)
    const [scrollYAtFetch, setScrollYAtFetch] = useState(0);
    const setRef = useCallback((node) => {
        lastMessageRef.current = node; 
      }, [])
    
    useEffect(()=>{
        if(conversationMessages)
            setMessages(conversationMessages)
    },[conversationMessages])  

    useEffect(()=>{
        if(isMessageAdded) return
        if(messagesContainerRef.current && scrollYAtFetch !==null)
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - messagesContainerRef.current.offsetHeight - scrollYAtFetch
        if(!nextCursor || isLoadingEarlier) return
        const observer = new IntersectionObserver(entries=>{
            const firstMessage = entries[0]
            if(firstMessage?.isIntersecting)
                loadMessages()
        },
        {
            rootMargin: "0px 0px 250px 0px"
        })
        if(loadMoreIntersect.current)
            setTimeout(()=>{
                observer.observe(loadMoreIntersect.current)
                },100)
        return ()=> {
            observer.disconnect()}
    },[messages])

    function loadMessages()
    {
        setIsLoadingEarlier(true)
        axiosClient.get(`/conversations/${conversationId}/messages?cursor=${nextCursor}`).then(({data})=>{
            setMessages(prev=>[...data.data,...prev])
            setNextCursor(data.nextCursor)
            const scrollHeight = messagesContainerRef.current.scrollHeight;
            const scrollTop = messagesContainerRef.current.scrollTop;
            const clientHeight = messagesContainerRef.current.clientHeight;
            const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight
            setScrollYAtFetch(tmpScrollFromBottom)
        }).catch((error)=>{
            handleSessionTimeOut(error)
        }).finally(()=>{
            setIsLoadingEarlier(false)
        })   
    }

    useEffect(()=>{
        listenForAIMessage()
        listenForMessageErrors()
        return ()=>{
            echo.leave(`conversations.${conversationId}`)
            echo.leave(`conversations-message-failed.${conversationId}`)
        }
    },[])
    function listenForAIMessage(){
        echo.private(`conversations.${conversationId}`)
        .listen('MessageReceived',({message})=>{ 
            if(!aiLoadingMessageIdRef.current) return
            setMessages(prev => {
                const updatedMessages = prev.filter(message => message.id !== aiLoadingMessageIdRef.current);
                updatedMessages.push(message); 
                return [...updatedMessages]; 
            });
            setIsMessageSending(false)
            setIsMessageAdded(true)
        })
        .error(error=>{
            handleSessionTimeOut(error)
            //handleFailedMessage()
        })
        
    }


    const onMessageSend = useCallback((sentMessage) => {
        if(messages.at(-1)?.type === "ai-failed")
            setMessages(prev=>prev.slice(0,-2))
        setIsMessageSending(true)
        const message = { id: uuid(), ...sentMessage };
    
        const aiLoadingMessageId = uuid();
        aiLoadingMessageIdRef.current = aiLoadingMessageId
        const aiLoadingMessage = {
            id: aiLoadingMessageId,
            type: "ai-loading",
            content: "Fetching knowledge..."
        };
    
        setMessages(prev => [...prev, message, aiLoadingMessage]);
        setIsMessageAdded(true)
        axiosClient.post(`conversations/${conversationId}/messages`, {
            message: message.content
        }).catch(error => {
            handleSessionTimeOut(error)
            handleFailedMessage()
        })
    },[])

    const onDownloadClick = async (id) => {
        if (!id) return;
    
        const promise = axiosClient.get(`/messages/${id}/export/pdf`, {
            responseType: "blob"
        })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = "document.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    
        toast.promise(promise, {
            loading: "Downloading...",
            success: "Response downloaded successfully",
            error: "Error: Failed to initiate download."
        });
    };
    


    function handleFailedMessage()
    {
        setMessages(prev => {
            const updatedMessages = prev.filter(message => message.id !== aiLoadingMessageIdRef.current);
            updatedMessages.push({ id: uuid(), type:"ai-failed",content:"Oops! Something went wrong while processing your request. Please try again."}); 
            return [...updatedMessages];  // to come back
        });
        setIsMessageAdded(true)
        setIsMessageSending(false)
    }

    function listenForMessageErrors()
    {
        echo.private(`conversations-message-failed.${conversationId}`)
        .listen('MessageSocketFailed',({message})=>{ 
            if(!aiLoadingMessageIdRef.current) return
                handleFailedMessage()   

        })
        .error((error)=>{
            handleSessionTimeOut(error)

        })
    }

    useEffect(() => {   
        if (!lastMessageRef.current || !isMessageAdded) return;
        lastMessageRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
        setIsMessageAdded(false)

    }, [messages]); 
    
  return (
    <>  
        <div className="flex-1 px-6 lg:px-0 w-full pt-6 pb-4 overflow-y-auto bg-main"  ref={messagesContainerRef}>
            <div className="lg:w-[760px] w-full self-center place-self-center gap-4 flex flex-col">
            {messages.length > 0 && <div ref={loadMoreIntersect}></div>}
            {(isLoadingEarlier && nextCursor) && <Loader size={11} className="animate-spin mx-auto dark:text-white" />}
            {messages.length > 0 && messages.map((message,index)=>(
                <MessageItem key={index} message={message} ref={index === messages.length - 1 ? setRef : null} onDownloadClick={()=>onDownloadClick(message.id)} />
            ))}
            </div>
        </div>

        <MessageInput conversationId={conversationId} onMessageSend={onMessageSend} isMessageSending={isMessageSending}/>  
    </>
  )
}
