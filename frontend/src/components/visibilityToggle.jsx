import React from "react";

const VisibilityToggle = ({ visibility, setVisibility }) => {
  return (
    <div style={{ margin: "10px 0", display: "flex", gap: "10px" }}>
      <button
        type="button"
        onClick={() => setVisibility("public")}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          backgroundColor: visibility === "public" ? "#007bff" : "#f0f0f0",
          color: visibility === "public" ? "white" : "black",
          cursor: "pointer",
        }}
      >
        🌍 Público
      </button>

      <button
        type="button"
        onClick={() => setVisibility("friends")}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          backgroundColor: visibility === "friends" ? "#28a745" : "#f0f0f0",
          color: visibility === "friends" ? "white" : "black",
          cursor: "pointer",
        }}
      >
        🤝 Apenas amigos
      </button>
    </div>
  );
};

export default VisibilityToggle;
