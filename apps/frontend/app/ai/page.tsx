// filepath: app/ai/page.tsx

"use client";

import { useState } from "react";
import api from "../../lib/axios";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";
import { useSidebar } from "../../components/layout/sidebar-context";

export default function AIPage() {
  const { isCollapsed } = useSidebar();
  const [chat, setChat] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const send = async () => {
    const res = await api.post("/ai", { prompt: input });

    setChat([...chat, { q: input, a: res.data.answer }]);
    setInput("");
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 
                ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />

        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {chat.map((c, i) => (
            <div key={i}>
              <p className="font-semibold">You:</p>
              <p>{c.q}</p>

              <p className="font-semibold mt-2">AI:</p>
              <p>{c.a}</p>
            </div>
          ))}
        </div>

        <div className="p-4 flex gap-2 border-t">
          <input
            className="flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}