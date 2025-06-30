import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../socket";
import ChatPopup from "./ChatPopup";
import { useAuth } from "../context/authContext";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const handler = () => {
      if (!open) setUnread((u) => u + 1);
    };
    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, [open]);

  useEffect(() => {
    if (location.pathname.startsWith("/messages")) {
      setOpen(false);
    }
  }, [location]);

  const toggle = () => {
    setOpen((o) => !o);
    if (!open) setUnread(0);
  };

  if (!user || location.pathname.startsWith("/messages")) return null;

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
      {open && <ChatPopup onClose={toggle} />}
    </>
  );
}
