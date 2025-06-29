import React from "react";
import { useLocation } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";

export default function MessagesPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const userId = params.get("user");
  return (
    <div className="p-4 mt-16">
      <h2 className="text-xl font-semibold mb-4">Mensagens</h2>
      <ChatWindow userId={userId ? Number(userId) : null} />
    </div>
  );
}
