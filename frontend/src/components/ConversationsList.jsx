import React, { useEffect, useState } from "react";
import Avatar from "./avatar";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function ConversationsList({ onSelect }) {
  const [convos, setConvos] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setConvos(data);
      })
      .catch((err) => console.error("Erro ao buscar conversas:", err));
  }, [token]);

  return (
    <div className="bg-white border rounded shadow-sm">
      {convos.length === 0 ? (
        <div className="p-2 text-sm text-gray-500">Sem conversas</div>
      ) : (
        convos.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect && onSelect(c.id)}
          >
            <Avatar
              url={c.avatar_url}
              name={`${c.first_name} ${c.last_name}`}
              size={28}
            />
            <span className="flex-1 text-sm truncate">
              {c.first_name} {c.last_name}
            </span>
            {c.unread_count > 0 && (
              <span className="text-xs bg-red-500 text-white rounded-full px-2">
                {c.unread_count}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
