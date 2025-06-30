import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import ConversationsList from "../components/ConversationsList";
import FriendsList from "../components/FriendsList";

export default function MessagesPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const userId = params.get("user");

  const openChat = (id) => {
    navigate(`/messages?user=${id}`);
  };

  return (
    <div className="p-4 mt-16 flex gap-4 h-[calc(100vh-6rem)]">
      <div className="w-72 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Conversas</h2>
          <ConversationsList onSelect={openChat} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Amigos</h2>
          <FriendsList onSelect={openChat} />
        </div>
      </div>
      <div className="flex-1">
        <ChatWindow userId={userId ? Number(userId) : null} />
      </div>
    </div>
  );
}
