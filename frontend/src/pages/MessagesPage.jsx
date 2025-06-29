import React from "react";
import ChatWindow from "../components/ChatWindow";

export default function MessagesPage() {
  return (
    <div className="p-4 mt-16">
      <h2 className="text-xl font-semibold mb-4">Mensagens</h2>
      <ChatWindow />
    </div>
  );
}
