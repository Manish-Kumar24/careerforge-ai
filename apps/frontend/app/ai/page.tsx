// filepath: app/ai/page.tsx

"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Copy, Check, Loader2, Send, Bold, Code, Quote, List,
  Download, ThumbsUp, ThumbsDown, Sparkles, Keyboard
} from "lucide-react";
import api from "../../lib/axios";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";
import { useSidebar } from "../../components/layout/sidebar-context";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

// ✅ Premium Types
type ChatMessage = {
  id: string;
  q: string;
  a: string;
  timestamp: Date;
  reactions?: { likes: number; dislikes: number; userVote?: 'like' | 'dislike' };
};

type MarkdownToolbarAction = 'bold' | 'code' | 'quote' | 'list';

const SUGGESTED_PROMPTS = [
  "Explain binary search with time complexity",
  "How do I prepare for a Meta SDE interview?",
  "What's the difference between REST and GraphQL?",
  "Help me improve my resume for AI/ML roles",
  "Walk me through a system design for URL shortener",
];

export default function AIPage() {
  const { isCollapsed } = useSidebar();
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [exporting, setExporting] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Ctrl/Cmd + Enter: Send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && input.trim()) {
        e.preventDefault();
        send();
      }
      // Escape: Clear input
      if (e.key === 'Escape' && input) {
        setInput("");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const messageId = `msg-${Date.now()}`;

    // Optimistic add to chat (with loading state for AI response)
    setChat(prev => [...prev, {
      id: messageId,
      q: userMessage,
      a: "", // Will be filled when response arrives
      timestamp: new Date(),
      reactions: { likes: 0, dislikes: 0 }
    }]);

    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/ai", { prompt: userMessage });

      // Update the last message with AI response
      setChat(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, a: res.data.answer }
          : msg
      ));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to get AI response");
      // Remove the optimistic message on error
      setChat(prev => prev.filter(msg => msg.id !== messageId));
      setInput(userMessage); // Restore input for retry
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }, [send]);

  // ✅ Insert markdown syntax at cursor position
  const insertMarkdown = useCallback((action: MarkdownToolbarAction) => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    let insertion = "";
    let newCursorPos = start;

    switch (action) {
      case 'bold':
        insertion = `**${value.slice(start, end)}**`;
        newCursorPos = start + 2;
        break;
      case 'code':
        insertion = `\`${value.slice(start, end)}\``;
        newCursorPos = start + 1;
        break;
      case 'quote':
        insertion = `> ${value.slice(start, end)}`;
        newCursorPos = start + 2;
        break;
      case 'list':
        insertion = `- ${value.slice(start, end)}`;
        newCursorPos = start + 2;
        break;
    }

    const newValue = value.slice(0, start) + insertion + value.slice(end);
    setInput(newValue);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    setShowToolbar(false);
  }, []);

  // ✅ Copy code with visual feedback fix
  const copyCode = useCallback(async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(codeId);
      // Visual feedback for 2 seconds
      setTimeout(() => {
        setCopiedCode(prev => prev === codeId ? null : prev);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  // ✅ React to AI response (like/dislike)
  const reactToMessage = useCallback((messageId: string, type: 'like' | 'dislike') => {
    setChat(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;

      const current = msg.reactions || { likes: 0, dislikes: 0 };
      const isSameVote = current.userVote === type;

      return {
        ...msg,
        reactions: {
          likes: current.likes + (type === 'like' ? (isSameVote ? -1 : 1) : 0),
          dislikes: current.dislikes + (type === 'dislike' ? (isSameVote ? -1 : 1) : 0),
          userVote: isSameVote ? undefined : type
        }
      };
    }));

    // TODO: Send feedback to backend for model improvement
    // api.post("/ai/feedback", { messageId, type })
  }, []);

  // ✅ Export chat as Markdown text (reliable, no canvas issues)
  const exportChat = useCallback(async () => {
    if (chat.length === 0 || exporting) return;

    setExporting(true);
    setError(null);

    try {
      // Generate plain text with Markdown formatting
      const text = chat.map(msg => {
        const time = msg.timestamp.toLocaleString();
        return `### ${time}

**You:**
${msg.q}

**AI Assistant:**
${msg.a}

---`;
      }).join('\n\n');

      // Create and download file using Blob API (no canvas, no CSS parsing)
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-chat-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err: any) {
      setError("Failed to export chat. Please try again.");
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  }, [chat, exporting]);

  // ✅ Memoized markdown renderer with premium styling
  const renderMarkdown = useMemo(() => {
    return (content: string, messageId: string) => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");
            const codeId = messageId; // ✅ Stable ID for copy feedback

            // ✅ CORRECT: Return ternary with proper JSX structure
            return !inline && match ? (
              <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                {/* Language header with copy button */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#21252b] text-[#abb2bf] text-xs font-mono border-b border-[#3e4451]">                  <span className="flex items-center gap-2">
                    <Code className="w-3 h-3" />
                    {match[1].toUpperCase()}
                  </span>
                  <button
                    key={copiedCode === codeId ? "copied" : "copy"}
                    onClick={() => copyCode(codeContent, codeId)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 text-xs font-medium"
                    aria-label="Copy code"
                  >
                    {copiedCode === codeId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="!m-0 !rounded-none !text-sm !leading-relaxed"
                  customStyle={{ background: "transparent", backgroundColor: "#282c34" }}
                  showLineNumbers
                  {...props}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-mono text-pink-600 dark:text-pink-400 border border-gray-200 dark:border-gray-700" {...props}>
                {children}
              </code>
            );
          },
          // Premium heading styles
          h1: ({ children }) => <h1 className="text-2xl font-bold mt-7 mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium mt-5 mb-2.5 text-gray-900 dark:text-white">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-medium mt-4 mb-2 text-gray-900 dark:text-white">{children}</h4>,

          // Premium list styles
          ul: ({ children }) => <ul className="list-disc list-outside ml-5 space-y-1.5 my-3 text-gray-700 dark:text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside ml-5 space-y-1.5 my-3 text-gray-700 dark:text-gray-300">{children}</ol>,
          li: ({ children }) => <li className="pl-1.5 leading-relaxed">{children}</li>,

          // Premium table styles
          table: ({ children }) => (
            <div className="overflow-x-auto my-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">{children}</thead>,
          tbody: ({ children }) => <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors duration-150">{children}</tr>,
          th: ({ children }) => <th className="px-5 py-3.5 text-left font-semibold text-gray-900 dark:text-white">{children}</th>,
          td: ({ children }) => <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">{children}</td>,

          // Premium link styles
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline-offset-2 hover:underline transition-colors duration-150 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Premium blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500/80 pl-5 py-3 my-4 bg-blue-50/60 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic rounded-r-lg shadow-sm">
              {children}
            </blockquote>
          ),

          // Premium horizontal rule
          hr: () => <hr className="my-7 border-gray-200 dark:border-gray-700" />,

          // Premium paragraph
          p: ({ children }) => <p className="my-2.5 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,

          // Premium strong/em
          strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-600 dark:text-gray-400">{children}</em>,

          // Premium strikethrough (GFM)
          del: ({ children }) => <del className="text-gray-400 dark:text-gray-500 line-through">{children}</del>,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }, [copiedCode, copyCode]);

  // Format timestamp with relative time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Show relative time if < 24h, otherwise show full time
    if (diff < 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Sidebar />

      <div className={`flex-1 flex flex-col transition-all duration-300 
                ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />

        {/* Premium Header */}
        <div className="p-6 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                AI Assistant
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Ask questions about interviews, resumes, or career advice
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Export Button */}
              <Button
                onClick={exportChat}
                disabled={chat.length === 0 || exporting}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export
              </Button>
              {/* Keyboard Shortcuts Hint */}
              <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-500 dark:text-gray-400">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Ctrl+K to focus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Prompts (when chat is empty) */}
        {chat.length === 0 && !loading && (
          <div className="p-6 flex-shrink-0 animate-slide-up">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                  className="px-3.5 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all duration-200 text-gray-700 dark:text-gray-300 text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-6 space-y-6 overflow-y-auto scroll-smooth"
        >
          {chat.map((msg) => {
            const messageId = msg.id;
            const hasResponse = msg.a.length > 0;

            return (
              <div key={messageId} className="space-y-4 animate-fade-in">
                {/* User Message */}
                <div className="flex justify-end group">
                  <Card className="max-w-[85%] md:max-w-[75%] bg-gradient-to-br from-blue-600 to-blue-700 border-blue-700/50 shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-2 px-4 pt-3">
                      <p className="font-medium text-xs text-blue-100/90">You</p>
                      <p className="text-xs text-blue-200/70">{formatTime(msg.timestamp)}</p>
                    </div>
                    <p className="text-white whitespace-pre-wrap px-4 pb-3 leading-relaxed">{msg.q}</p>
                  </Card>
                </div>

                {/* AI Message - Premium Markdown */}
                <div className="flex justify-start group">
                  <Card className="max-w-[85%] md:max-w-[75%] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-2 px-4 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <p className="font-medium text-xs text-gray-600 dark:text-gray-400">AI Assistant</p>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{formatTime(msg.timestamp)}</p>
                    </div>

                    {/* Response Content or Loading State */}
                    <div className="px-4 pb-3">
                      {hasResponse ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none 
                                      prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white
                                      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                                      prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                                      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
                                      prose-strong:text-gray-900 dark:prose-strong:text-white
                                      prose-ul:list-disc prose-ol:list-decimal"
                        >
                          {renderMarkdown(msg.a, messageId)}
                        </div>
                      ) : (
                        // Typing indicator for AI response
                        <div className="flex items-center gap-2 py-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</p>
                        </div>
                      )}
                    </div>

                    {/* Reactions (only show after response) */}
                    {hasResponse && (
                      <div className="flex items-center gap-1 px-4 pb-3 border-t border-gray-100 dark:border-gray-700/50 pt-2">
                        <button
                          onClick={() => reactToMessage(messageId, 'like')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all duration-150 ${msg.reactions?.userVote === 'like'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{msg.reactions?.likes || 0}</span>
                        </button>
                        <button
                          onClick={() => reactToMessage(messageId, 'dislike')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all duration-150 ${msg.reactions?.userVote === 'dislike'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>{msg.reactions?.dislikes || 0}</span>
                        </button>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            );
          })}

          {/* Error Message */}
          {error && (
            <Card className="bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-shake">
              <p className="text-sm text-red-700 dark:text-red-300 p-3.5 flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
            </Card>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Markdown Toolbar (toggle) */}
        {showToolbar && (
          <div className="flex-shrink-0 px-6 pb-2 animate-slide-up">
            <div className="flex gap-1.5 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-w-4xl mx-auto">
              <button
                onClick={() => insertMarkdown('bold')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => insertMarkdown('code')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Inline Code"
              >
                <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => insertMarkdown('quote')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Quote"
              >
                <Quote className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => insertMarkdown('list')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Premium Input Area - Pinned to Bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="flex gap-3 max-w-4xl mx-auto items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything... (Shift+Enter for new line)"
                disabled={loading}
                onFocus={() => setShowToolbar(true)}
                onBlur={() => setTimeout(() => setShowToolbar(false), 200)}
                className="flex-1 !w-auto min-w-0 pr-10
                         text-gray-900 dark:text-gray-100 
                         placeholder-gray-400 dark:placeholder-gray-500
                         bg-white dark:bg-gray-800
                         border-gray-300 dark:border-gray-600
                         focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                         transition-all duration-200"
              />
              {/* Toolbar toggle hint */}
              <button
                onClick={() => setShowToolbar(!showToolbar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Markdown toolbar"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={send}
              disabled={loading || !input.trim()}
              className="!w-auto shrink-0 px-5 py-2.5 min-w-[70px] 
                       whitespace-nowrap
                       bg-gradient-to-r from-blue-600 to-blue-700 
                       hover:from-blue-700 hover:to-blue-800
                       focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                       dark:focus:ring-offset-gray-900
                       transition-all duration-200 shadow-sm hover:shadow"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px]">Enter</kbd> to send •
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] mx-0.5">Shift+Enter</kbd> for new line •
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] mx-0.5">Ctrl+K</kbd> to focus
          </p>
        </div>
      </div>
    </div>
  );
}