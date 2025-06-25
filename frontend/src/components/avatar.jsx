import React from "react";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function Avatar({ url, name, size = 40 }) {
  const src = url
    ? /^(https?:|blob:|data:)/.test(url)
      ? url
      : `${API}/uploads/${url}`
    : null;

  return src ? (
    <div
      className="rounded-full overflow-hidden border shadow"
      style={{ width: size, height: size }}
    >
      <img src={src} alt={name} className="w-full h-full object-cover" />
    </div>
  ) : (
    <div
      className="bg-gray-300 text-white rounded-full flex items-center justify-center font-bold border shadow"
      style={{ width: size, height: size }}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}
