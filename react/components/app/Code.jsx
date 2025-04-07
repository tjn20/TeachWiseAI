import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button } from "../ui/button"
import { Check, Copy } from "lucide-react"
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dracula,oneDark,oneLight   } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from 'react';
export default function Code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeContent = String(children).replace(/\n$/, "");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return !inline && match ? (
      <div className="relative">
        <CopyToClipboard text={codeContent} onCopy={handleCopy}>
          <Button
          variant="ghost"
          size="xsm"
          className="absolute top-2 right-2"
          >
            {copied ? (
              <Check className="text-green-500" size={16} />
            ) : (
              <Copy className="text-gray-700" size={16} />
            )}
          </Button>
        </CopyToClipboard>
        <SyntaxHighlighter
          style={oneLight}
          language={match[1]}
          PreTag="div"
          {...props}
          customStyle={{ fontSize: '0.85rem' }} 
        >
          {codeContent}
        </SyntaxHighlighter>
      </div> )
       : (
            <code className="bg-gray-200 px-1 rounded-sm text-sm">{children}</code> // Smaller text for inline code
        );
}
