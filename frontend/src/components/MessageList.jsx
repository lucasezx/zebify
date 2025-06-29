import React, { useEffect, useRef } from "react";

export default function MessageList({ messages, currentUser }) {
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2 text-sm">
      {messages.map((m) => (
        <div key={m.id} className={`flex ${m.sender_id === currentUser ? 'justify-end' : ''}`}> 
          <div className={`px-2 py-1 rounded max-w-[80%] whitespace-pre-wrap break-words ${m.sender_id === currentUser ? 'bg-emerald-100' : 'bg-gray-100'}`}>{m.content}</div>
        </div>
      ))}
    </div>
  );
}
