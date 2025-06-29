import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useAuth } from "../context/authContext";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function ChatWindow({ onClose, userId }) {

  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState([]);

  const popup = Boolean(onClose);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/friends`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setFriends);
  }, [token]);

  useEffect(() => {
    if (!userId || !friends.length) {
      setActive(null);
      return;
    }
    const f = friends.find((fr) => fr.id === Number(userId));
    if (f) setActive(f);
  }, [userId, friends]);

  useEffect(() => {

    if (!active) return;
    fetch(`${API}/api/messages/${active.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error("Erro ao buscar mensagens:", data);
          setMessages([]);
        }

        socket.emit("mark_read", active.id);
      });
  }, [active, token]);

  useEffect(() => {
    const add = (id) => setOnline((o) => Array.from(new Set([...o, Number(id)])));
    const remove = (id) => setOnline((o) => o.filter((u) => u !== Number(id)));
    socket.on("user_online", add);
    socket.on("user_offline", remove);
    return () => {
      socket.off("user_online", add);
      socket.off("user_offline", remove);
    };
  }, []);

  useEffect(() => {
    const receive = (msg) => {
      if (active && Number(msg.sender_id) === active.id) {
        setMessages((prev) => [...prev, msg]);
        socket.emit("mark_read", active.id);
      }
    };
    socket.on("receive_message", receive);
    return () => socket.off("receive_message", receive);
  }, [active]);

  const sendMessage = (text) => {
    if (!active) return;
    socket.emit("send_message", { receiverId: active.id, content: text });
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender_id: user.id,
        receiver_id: active.id,
        content: text,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const containerClasses = popup
    ? "bg-white shadow-lg rounded-lg w-full max-h-[400px] flex flex-col text-sm"
    : "bg-white border rounded shadow flex flex-col h-full text-sm";

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between p-2 border-b">
        <span className="flex-1 mr-2 truncate">
          {active
            ? `${online.includes(active.id) ? "\u25CF" : "\u25CB"} ${
                active.name || active.first_name + " " + active.last_name
              }`
            : "Selecione um amigo"}
        </span>
        {onClose && (
          <button onClick={onClose} className="text-lg px-2">
            ×
          </button>
        )}
      </div>
      <MessageList messages={messages} currentUser={user.id} />
      <MessageInput onSend={sendMessage} disabled={!active} />
    </div>
  );
}
