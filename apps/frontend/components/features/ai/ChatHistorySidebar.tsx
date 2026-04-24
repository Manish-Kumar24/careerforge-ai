// filepath: apps/frontend/components/features/ai/ChatHistorySidebar.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, Trash2, Pencil, X, Menu } from "lucide-react";
import { useChatSession, SessionPreview } from "@/store/useChatSession";
import { Button } from "@/components/ui/button";

interface ChatHistorySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ChatHistorySidebar({ isOpen = true, onClose }: ChatHistorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { sessions, loadSessions, createSession, deleteSession, activeSessionId } = useChatSession();
  
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleNewChat = async () => {
    try {
      const session = await createSession();
      router.push(`/ai/${session._id}`);
      if (isMobile && onClose) onClose();
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  const handleSelectSession = (id: string) => {
    router.push(`/ai/${id}`);
    if (isMobile && onClose) onClose();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this chat? This cannot be undone.")) {
      try {
        await deleteSession(id);
        if (activeSessionId === id) {
          router.push("/ai");
        }
      } catch (err) {
        console.error("Failed to delete session", err);
      }
    }
  };

  const startRename = (e: React.MouseEvent, session: SessionPreview) => {
    e.stopPropagation();
    setRenamingId(session._id);
    setRenameValue(session.title);
  };

  const saveRename = async (id: string) => {
    // Note: Backend PATCH endpoint not implemented yet; local-only update for now
    const { updateSessionTitle } = useChatSession.getState();
    await updateSessionTitle(id, renameValue);
    setRenamingId(null);
  };

  const isActive = (id: string) => pathname === `/ai/${id}` || (pathname === "/ai" && !id);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Chat History</h3>
          {isMobile && onClose && (
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Button onClick={handleNewChat} className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
              No conversations yet
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                onClick={() => handleSelectSession(session._id)}
                onMouseEnter={() => setHoveredId(session._id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors
                  ${isActive(session._id)
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }
                `}
              >
                {renamingId === session._id ? (
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => saveRename(session._id)}
                    onKeyDown={(e) => e.key === "Enter" && saveRename(session._id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent border-b border-blue-500 focus:outline-none text-sm"
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="flex-1 truncate text-sm">{session.title}</span>
                    {hoveredId === session._id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startRename(e, session)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Rename"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, session._id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Mobile Toggle Button (when closed) */}
        {isMobile && !isOpen && (
          <button
            onClick={onClose}
            className="md:hidden fixed bottom-4 left-4 p-3 bg-blue-600 text-white rounded-full shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>
    </>
  );
}