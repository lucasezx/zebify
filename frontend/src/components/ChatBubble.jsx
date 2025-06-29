import React, { useEffect, useState } from "react";
import socket from "../socket";
import ChatWindow from "./ChatWindow";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const handler = () => {
      if (!open) setUnread((u) => u + 1);
    };
    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, [open]);

  const toggle = () => {
    setOpen((o) => !o);
    if (!open) setUnread(0);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <div
          onClick={toggle}
          className="relative bg-emerald-500 text-white rounded-full p-3 cursor-pointer shadow-lg"
        >
          💬
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
              {unread}
            </span>
          )}
        </div>
      </div>
      {open && <ChatWindow onClose={toggle} />}
    </>
  );
}
