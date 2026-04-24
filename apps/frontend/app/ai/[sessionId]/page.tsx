// filepath: apps/frontend/app/ai/[sessionId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useSidebar } from "@/components/layout/sidebar-context";
import ChatHistorySidebar from "@/components/features/ai/ChatHistorySidebar";
import ChatInterface from "@/components/features/ai/ChatInterface";
import { useChatSession, ChatMessage } from "@/store/useChatSession";

export default function ExistingChatPage() {
  const params = useParams();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const { setActiveSession, activeSession, addMessage, deleteSession, updateSessionTitle, sessions } = useChatSession();
  
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load session on mount
  useEffect(() => {
    if (sessionId) {
      setActiveSession(sessionId);
    }
  }, [sessionId, setActiveSession]);

  const handleSendMessage = async (message: ChatMessage) => {
    if (!sessionId) return;
    await addMessage(sessionId, message);
  };

  const handleDeleteSession = async () => {
    if (!sessionId) return;
    await deleteSession(sessionId);
    router.push("/ai");
  };

  const handleRenameSession = async (newTitle: string) => {
    if (!sessionId) return;
    await updateSessionTitle(sessionId, newTitle);
  };

  const currentSession = sessions.find(s => s._id === sessionId);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      
      <div className={`flex-1 flex transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />
        
        {/* History Sidebar with mobile toggle */}
        <ChatHistorySidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          ☰
        </button>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatInterface
            sessionId={sessionId}
            initialMessages={activeSession?.messages || []}
            onSendMessage={handleSendMessage}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
            currentTitle={currentSession?.title || "Loading..."}
            isLoading={!activeSession}
          />
        </div>
      </div>
    </div>
  );
}