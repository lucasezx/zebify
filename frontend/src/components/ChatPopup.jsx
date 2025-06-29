import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import ConversationsList from "./ConversationsList";

export default function ChatPopup({ onClose }) {
  const [userId, setUserId] = useState(null);

  return (
    <div className="fixed bottom-16 right-4 bg-white shadow-lg rounded-lg w-80 max-h-[400px] flex text-sm z-50">
      {userId ? (
        <ChatWindow userId={userId} onClose={() => setUserId(null)} />
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <span className="font-semibold">Conversas</span>
            <button onClick={onClose} className="text-lg px-2">
              ×
            </button>
          </div>
          <ConversationsList onSelect={setUserId} />
        </div>
      )}
    </div>
  );
}
