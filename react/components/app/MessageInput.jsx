import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { ArrowDown, SendHorizontal, Square } from 'lucide-react'
import { motion } from 'framer-motion'


const MessageInput = React.memo(({onMessageSend,isMessageSending,showScrollButton,onScrollClick})=>{
    const [message, setMessage] = useState("")
    const input = useRef(null)

    const onInputChange = (ev) => {
        if(ev.target.value.length > 1500) return
        setMessage(ev.target.value)
    }

    const onKeyDown = (ev) => {
        if(ev.key === "Enter" && !ev.shiftKey)
        {
            ev.preventDefault()
            onSend()
            
        }    
    }

    const formatMessage = () => {
        return {
            type: "human",
            content: message,
        }
    }

    const onSend = () => {
        if(!message || isMessageSending || message.length > 1500) return
        onMessageSend(formatMessage())
        setMessage("")
    }

    const getScrollHeight = () => {
        if(!input.current) return
        return message.length === 0 ? 48 : input.current.scrollHeight;
    }

    return (
        <div className='sticky bottom-0'>
            <div className={`relative transition-opacity duration-200 ease-in-out
                    ${showScrollButton ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
            `}>
                <div className="absolute -top-11 w-full flex justify-center z-30">
                <Button
                  size="circle"
                  className="bg-white text-black dark:bg-sidebarInset dark:text-white border hover:bg-white dark:hover:bg-sidebarInset dark:border-black"
                  onClick={onScrollClick}                  
                >
                  <ArrowDown  />
                </Button>
              </div>
            </div>
            <div className="w-full bg-white z-40 flex items-center justify-center dark:bg-[#1b1c1d] pb-4">
                <motion.div
                    className='w-[90%] md:w-[75%] lg:max-w-[760px] max-h-40 min-h-16 rounded-2xl flex dark:text-white px-3 pt-1 pb-2 border border-gray-200 dark:border-gray-600 shadow-md'
                    initial={{ height: 48 }}  
                    animate={{ height: getScrollHeight() }} 
                    transition={{ duration: 0.3, ease: "easeInOut" }}  
                >
                    <textarea
                        placeholder='Ask your Assistant!'
                        rows={1}
                        ref={input}
                        value={message}
                        onChange={ev => onInputChange(ev)}
                        onKeyDown={ev=>onKeyDown(ev)}
                        className="resize-none overflow-y-auto min-h-full bg-transparent focus:outline-none w-full border-none  font-serif"
                        style={{
                            paddingTop: '14px', 
                            paddingBottom: '17px', 
                            verticalAlign: 'middle', 
                        }}
                    />
                    <Button variant="ghost" size="circle" className="sticky bottom-0 self-end [&_svg]:size-6 animate-in duration-200 fade-in-20 zoom-in-50" disabled={!message.trim() || isMessageSending} onClick={()=>onSend()}><SendHorizontal /></Button>
                </motion.div>
            </div>
        </div>
    )
})

export default MessageInput