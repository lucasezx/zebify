import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import ConversationsList from "../components/ConversationsList";

export default function MessagesPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const userId = params.get("user");

  const openChat = (id) => {
    navigate(`/messages?user=${id}`);
  };

  return (
    <div className="p-4 mt-16 flex gap-4">
      <div className="w-64">
        <h2 className="text-xl font-semibold mb-4">Conversas</h2>
        <ConversationsList onSelect={openChat} />
      </div>
      <div className="flex-1">
        <ChatWindow userId={userId ? Number(userId) : null} />
      </div>
    </div>
  );
}
