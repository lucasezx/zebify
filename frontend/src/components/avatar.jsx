import React from "react";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// Gera uma cor HSL baseada no nome
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export default function Avatar({ url, name, size = 40 }) {
  const src = url
    ? /^(https?:|blob:|data:)/.test(url)
      ? url
      : `${API}/uploads/${url}`
    : null;

  const bgColor = stringToColor(name || "");

  return src ? (
    <div
      className="rounded-full overflow-hidden border shadow"
      style={{ width: size, height: size }}
    >
      <img src={src} alt={name} className="w-full h-full object-cover" />
    </div>
  ) : (
    <div
      className="text-white rounded-full flex items-center justify-center font-bold border shadow"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
      }}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}
