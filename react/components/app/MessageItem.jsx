import lightModeImg from "@/src/assets/logo.png"
import darkModeImg from "@/src/assets/whiteLogo.png"
import Markdown from 'react-markdown'
import {
    Avatar,
    AvatarImage,
  } from "@/components/ui/avatar"
import React, { forwardRef, useState } from "react"
import { Check, Copy, Download, FileSearch } from "lucide-react"
import { useAuth } from "@/src/Context/AuthProvider"
import { hasPermission } from "@/src/auth"
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Code from "./Code"
import 'katex/dist/katex.min.css'; 
import {REMARK_PLUGINS,REHYPE_PLUGINS} from "@/src/utils/MarkdownPlugins.js"
import ToolTippedButton from "./ToolTippedButton"
import { useTheme } from "../../src/Context/theme-provider"

const MessageItem = React.memo(forwardRef(({message,onDownloadClick},ref)=>{
  const {type,content} = message
  const {user} = useAuth()
  const [copied, setCopied] = useState(false);
  const {theme} = useTheme()
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div ref={ref} className={"chat "+(type !== "human" ? "chat-start grid-cols-none flex flex-col md:grid-cols-[auto,1fr] md:flex-none md:grid": (type === "human" ? "chat-end": ""))}>
  {type !== "human" && (
    <div className="chat-image avatar self-start mt-[2px] ml-3 md:ml-0">
    <Avatar className="border border-white" >
       <AvatarImage src={theme && theme === 'dark' ? darkModeImg : lightModeImg} alt="@teachwiseai" />
   </Avatar> 
 </div>
  )}
  <div className={`chat-bubble overflow-x-auto font-serif ${type !== "human" && "w-full"} ${type === "ai-failed" && "error"}`} dir="auto">
    {(type === "ai"&& (
      <Markdown
      remarkPlugins={REMARK_PLUGINS} 
      rehypePlugins={REHYPE_PLUGINS} 
      components={{
        p: ({ children }) => (
          <p className="inline-block">{children}</p> 
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 flex flex-col gap-1 list-inside">{children}</ul> 
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 flex flex-col gap-1 list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li>{children}</li> 
        ),
        code: ({ node, inline, className, children, ...props }) => (
          <Code node={node} inline={inline} className={className} {...props}>
            {children}
          </Code>
        ),
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-md font-medium">{children}</h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-sm font-medium" >{children}</h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-xs font-medium">{children}</h6>
        ),
        abbr: ({ children, title }) => (
          <abbr className="tooltip badge-ghost badge" title={title}>{children}</abbr>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-300 w-full overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-gray-200">{children}</thead>,
        tbody: ({ children }) => <tbody className="bg-white">{children}</tbody>,
        tr: ({ children }) => <tr className="border-b first:rounded-tl-md first:rounded-tr-md">{children}</tr>,
        th: ({ children }) => (
          <th className="border px-4 py-2  font-medium text-md bg-gray-100 first:rounded-tl-md first:rounded-tr-md">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border px-4 py-2 text-left text-sm">{children}</td>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-500 hover:text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </Markdown>
          
    )) || content}
  </div>
  {type === "ai" && (
    <div className="chat-footer flex gap-1 items-center pl-4">
      <CopyToClipboard text={content} onCopy={handleCopy}>
      <ToolTippedButton title={copied ? "Copied" : "Copy"} size="xsm" variant="ghost" className="dark:text-white">
          {copied ? (
              <Check />
            ) : (
              <Copy />
            )}
        </ToolTippedButton>
        </CopyToClipboard>
        <ToolTippedButton title="Download" size="xsm" variant="ghost" className="dark:text-white" onClick={onDownloadClick}>
        <Download/>
        </ToolTippedButton>
      {/* {hasPermission(user,"view:source") && (
        <ToolTippedButton title="Source" size="xsm" variant="ghost" className="dark:text-white">
                <FileSearch/>
        </ToolTippedButton>
      )} */}
    </div>
  )}
    </div>
  )
}))

export default MessageItem

