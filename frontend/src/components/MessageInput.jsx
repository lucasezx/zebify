import React, { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onSend(text);
        setText("");
      }
    }
  };

  return (
    <textarea
      className="border-t p-2 text-sm resize-none focus:outline-none w-full"
      rows={2}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder={disabled ? "Selecione um amigo" : "Digite sua mensagem"}
    />
  );
}
