// filepath: app/ai/page.tsx

"use client";

import { useState, useRef, useEffect } from "react";
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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      {/* ✅ Main content: flex-col to stack header/chat/input vertically */}
      <div className={`flex-1 flex flex-col transition-all duration-300 
                ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Ask questions about interviews, resumes, or career advice
          </p>
        </div>

        {/* ✅ Chat Messages: flex-1 + overflow-y-auto to fill space + scroll */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {chat.map((c, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-end">
                <Card className="max-w-[85%] bg-blue-600 border-blue-700 shadow-none">
                  <p className="font-medium text-xs text-blue-100 mb-1">You</p>
                  <p className="text-white whitespace-pre-wrap">{c.q}</p>
                </Card>
              </div>
              <div className="flex justify-start">
                <Card className="max-w-[85%] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-1">AI</p>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{c.a}</p>
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

        {/* ✅ Input Area: flex-shrink-0 to stay pinned at bottom */}
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