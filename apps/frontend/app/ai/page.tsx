// filepath: app/ai/page.tsx

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../../lib/axios";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";
import { useSidebar } from "../../components/layout/sidebar-context";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function AIPage() {
  const { isCollapsed } = useSidebar();
  const [chat, setChat] = useState<Array<{ q: string; a: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const send = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post("/ai", { prompt: input });
      setChat(prev => [...prev, { q: input, a: res.data.answer }]);
      setInput("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // ✅ Memoized markdown renderer with syntax highlighting
  const renderMarkdown = useMemo(() => {
    return (content: string) => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ✅ Code blocks with syntax highlighting + copy button
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");
            
            return !inline && match ? (
              <div className="relative group my-3">
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg text-sm"
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
                {/* Copy button */}
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Copy
                </button>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          // ✅ Styled headings
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mt-3 mb-2 text-gray-900 dark:text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium mt-2 mb-1 text-gray-900 dark:text-white">{children}</h3>,
          // ✅ Styled lists
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-gray-700 dark:text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-gray-700 dark:text-gray-300">{children}</ol>,
          // ✅ Styled tables (GitHub-flavored)
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{children}</td>,
          // ✅ Styled links
          a: ({ children, href }) => (
            <a href={href} className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          // ✅ Styled blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-2 text-gray-600 dark:text-gray-400 italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className={`flex-1 flex flex-col transition-all duration-300 
                ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />

        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Ask questions about interviews, resumes, or career advice
          </p>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {chat.map((c, i) => (
            <div key={i} className="space-y-3">
              {/* User Message */}
              <div className="flex justify-end">
                <Card className="max-w-[85%] bg-blue-600 border-blue-700 shadow-none">
                  <p className="font-medium text-xs text-blue-100 mb-1">You</p>
                  <p className="text-white whitespace-pre-wrap">{c.q}</p>
                </Card>
              </div>

              {/* AI Message - ✅ Now renders rich markdown */}
              <div className="flex justify-start">
                <Card className="max-w-[85%] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-2">AI</p>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
                    {renderMarkdown(c.a)}
                  </div>
                </Card>
              </div>
            </div>
          ))}
          
          {error && (
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">⚠️ {error}</p>
            </Card>
          )}
          
          <div ref={chatEndRef} />
        </div>

        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex gap-3 max-w-4xl mx-auto items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 !w-auto min-w-0 
                       text-gray-900 dark:text-gray-100 
                       placeholder-gray-400 dark:placeholder-gray-500
                       bg-white dark:bg-gray-800"
            />
            <Button
              onClick={send}
              disabled={loading || !input.trim()}
              className="!w-auto shrink-0 px-6 py-2 min-w-[80px] 
                       whitespace-nowrap"
            >
              {loading ? "..." : "Send"}
            </Button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
            Press Enter to send • AI responses may take a few seconds
          </p>
        </div>
      </div>
    </div>
  );
}