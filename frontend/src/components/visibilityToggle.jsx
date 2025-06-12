import React from "react";

const VisibilityToggle = ({ visibility, setVisibility }) => {
  const baseStyle =
    "px-4 py-2 rounded-lg font-medium border transition duration-150";

  return (
    <div className="my-3 flex gap-3">
      <button
        type="button"
        onClick={() => setVisibility("public")}
        className={`${baseStyle} ${
          visibility === "public"
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
        }`}
      >
        🌍 Público
      </button>

      <button
        type="button"
        onClick={() => setVisibility("friends")}
        className={`${baseStyle} ${
          visibility === "friends"
            ? "bg-green-600 text-white border-green-600"
            : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
        }`}
      >
        🤝 Apenas amigos
      </button>

      <button
        type="button"
        onClick={() => setVisibility("private")}
        className={`${baseStyle} ${
          visibility === "private"
            ? "bg-gray-700 text-white border-gray-700"
            : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
        }`}
      >
        🔒 Apenas eu
      </button>
    </div>
  );
};

export default VisibilityToggle;
