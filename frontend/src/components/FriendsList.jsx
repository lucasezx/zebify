import React, { useEffect, useState } from "react";
import Avatar from "./avatar";
import socket from "../socket";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function FriendsList({ onSelect }) {
  const [friends, setFriends] = useState([]);
  const [online, setOnline] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setFriends(data))
      .catch((err) => console.error("Erro ao buscar amigos:", err));
  }, [token]);

  useEffect(() => {
    const add = (id) =>
      setOnline((o) => Array.from(new Set([...o, Number(id)])));
    const remove = (id) =>
      setOnline((o) => o.filter((u) => u !== Number(id)));
    const setList = (list) => setOnline(list.map(Number));

    socket.on("user_online", add);
    socket.on("user_offline", remove);
    socket.on("online_users", setList);

    return () => {
      socket.off("user_online", add);
      socket.off("user_offline", remove);
      socket.off("online_users", setList);
    };
  }, []);

  return (
    <div className="bg-white border rounded shadow-sm">
      {friends.length === 0 ? (
        <div className="p-2 text-sm text-gray-500">Sem amigos</div>
      ) : (
        friends.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect && onSelect(f.id)}
          >
            <Avatar url={f.avatar_url} name={f.name} size={28} />
            <span className="flex-1 text-sm truncate flex items-center gap-1">
              <span
                className={`text-xs ${
                  online.includes(f.id) ? "text-green-500" : "text-gray-400"
                }`}
              >
                ●
              </span>
              {f.name}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
