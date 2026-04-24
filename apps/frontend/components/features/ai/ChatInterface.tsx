// filepath: apps/frontend/components/features/ai/ChatInterface.tsx

"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Loader2, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "@/store/useChatSession";

interface ChatInterfaceProps {
  sessionId?: string;
  initialMessages?: ChatMessage[];
  onSendMessage: (message: ChatMessage) => Promise<void>;
  onDeleteSession?: () => void;
  onRenameSession?: (newTitle: string) => void;
  currentTitle?: string;
  isLoading?: boolean;
}

export default function ChatInterface({
  sessionId,
  initialMessages = [],
  onSendMessage,
  onDeleteSession,
  onRenameSession,
  currentTitle = "New Chat",
  isLoading = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(currentTitle);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync initial messages when they change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus title input when renaming
  useEffect(() => {
    if (isRenaming) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isRenaming]);

  const send = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    setInput("");
    setError(null);
    
    // Optimistic update
    setMessages(prev => [...prev, userMessage]);
    
    try {
      await onSendMessage(userMessage);
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      // Revert optimistic update on error
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage.content);
    }
  }, [input, isLoading, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }, [send]);

  const copyCode = useCallback(async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const handleTitleSubmit = () => {
    if (newTitle.trim() && onRenameSession) {
      onRenameSession(newTitle.trim());
      setIsRenaming(false);
    }
  };

  const renderMarkdown = useMemo(() => {
    return (content: string, messageId: string) => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");
            const codeId = `${messageId}-code-${Math.random().toString(36).slice(2, 8)}`;
            
            return !inline && match ? (
              <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono">
                  <span>{match[1].toUpperCase()}</span>
                  <button
                    onClick={() => copyCode(code, codeId)}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    {copiedCode === codeId ? (
                      <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Copied!</span></>
                    ) : (
                      <><Copy className="w-3 h-3" /><span>Copy</span></>
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="!m-0 !rounded-none !text-sm"
                  customStyle={{ background: "transparent" }}
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2 text-gray-900 dark:text-white">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc list-outside ml-4 space-y-1 my-2 text-gray-700 dark:text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside ml-4 space-y-1 my-2 text-gray-700 dark:text-gray-300">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>,
          th: ({ children }) => <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{children}</td>,
          a: ({ children, href }) => (
            <a href={href} className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">{children}</a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic">{children}</blockquote>
          ),
          p: ({ children }) => <p className="my-2 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }, [copiedCode, copyCode]);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header with Title + Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
        {isRenaming ? (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Input
              ref={titleInputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              onBlur={handleTitleSubmit}
              className="!w-auto flex-1"
              placeholder="Enter new title..."
            />
          </div>
        ) : (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{currentTitle}</h2>
        )}
        
        <div className="flex items-center gap-2">
          {onRenameSession && !isRenaming && (
            <button
              onClick={() => setIsRenaming(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Rename chat"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDeleteSession && (
            <button
              onClick={onDeleteSession}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Delete chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium mb-2">👋 Start a conversation</p>
            <p className="text-sm">Ask about interviews, resumes, or career advice</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const messageId = `msg-${i}`;
            return (
              <div key={messageId} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                <Card className={`max-w-[85%] ${
                  msg.role === "user" 
                    ? "bg-blue-600 border-blue-700" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}>
                  <div className={`flex items-center justify-between mb-1 px-4 pt-3 ${
                    msg.role === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    <span className="font-medium text-xs">{msg.role === "user" ? "You" : "AI Assistant"}</span>
                    {msg.timestamp && <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>}
                  </div>
                  <div className={`px-4 pb-4 ${
                    msg.role === "user" 
                      ? "text-white whitespace-pre-wrap" 
                      : "prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                  }`}>
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      renderMarkdown(msg.content, messageId)
                    )}
                  </div>
                </Card>
              </div>
            );
          })
        )}
        
        {error && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-shake">
            <p className="text-sm text-red-700 dark:text-red-300 p-3">⚠️ {error}</p>
          </Card>
        )}
        
        {isLoading && messages.length > 0 && (
          <div className="flex justify-start">
            <Card className="max-w-[85%] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 p-4">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</p>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex gap-3 max-w-4xl mx-auto items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... (Shift+Enter for new line)"
            disabled={isLoading}
            className="flex-1 !w-auto min-w-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800"
          />
          <Button
            onClick={send}
            disabled={isLoading || !input.trim()}
            className="!w-auto shrink-0 px-6 py-2.5 min-w-[80px] whitespace-nowrap"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
          </Button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}