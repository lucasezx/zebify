import React, { useState } from "react";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export default function Avatar({
  url,
  name,
  size = 40,
  className = "",
  ...rest
}) {
  const [imgError, setImgError] = useState(false);

  const src =
    url && !imgError
      ? /^(https?:|blob:|data:)/.test(url)
        ? url
        : `${API}/uploads/${url}`
      : null;

  const bgColor = stringToColor((name || "").trim().toLowerCase());

  return (
    <div
      className={`rounded-full overflow-hidden border shadow flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: !src ? bgColor : undefined,
      }}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="text-white font-bold leading-none select-none"
          style={{ fontSize: size * 0.45 }}
        >
          {name?.charAt(0)?.toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}
