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

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/friends`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setFriends);
  }, [token]);

  useEffect(() => {
    if (!userId || !friends.length) return;
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

  return (
    <div className="fixed bottom-16 right-4 bg-white shadow-lg rounded-lg w-72 max-h-[400px] flex flex-col text-sm">
      <div className="flex items-center justify-between p-2 border-b">
        <select
          className="flex-1 mr-2 border rounded px-1 py-0.5"
          onChange={(e) =>
            setActive(friends.find((f) => f.id === Number(e.target.value)))
          }
          value={active?.id || ""}
        >
          <option value="" disabled>
            Escolha...
          </option>
          {friends.map((f) => (
            <option key={f.id} value={f.id}>
              {online.includes(f.id) ? "\u25CF " : "\u25CB "}
              {f.name || f.first_name + " " + f.last_name}
            </option>
          ))}
        </select>
        <button onClick={onClose} className="text-lg px-2">×</button>
      </div>
      <MessageList messages={messages} currentUser={user.id} />
      <MessageInput onSend={sendMessage} disabled={!active} />
    </div>
  );
}
