import React, { useEffect } from "react";

export default function ProfilePictureModal({
  isOpen,
  onClose,
  imageUrl,
  userName,
  hideName = false, // ⬅️ nova prop
}) {
  useEffect(() => {
    if (!isOpen) return;
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-6 rounded-2xl shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-600 hover:text-black"
          aria-label="Fechar"
        >
          ×
        </button>

        <img
          src={imageUrl}
          alt={userName}
          className="w-56 h-56 mx-auto mb-3 object-cover rounded-none"
        />

        {!hideName && userName && (
          <p className="font-semibold text-lg">{userName}</p>
        )}
      </div>
    </div>
  );
}
