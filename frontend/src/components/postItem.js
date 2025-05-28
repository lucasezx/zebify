import { useState } from "react";
import { updatePost, deletePost } from "../services/posts";

function PostItem({ post, onChange }) {
  const [editing, setEditing] = useState(false);
  const [conteudo, setConteudo] = useState(post.conteudo ?? "");
  const [legenda, setLegenda] = useState(post.legenda ?? "");
  const [msg, setMsg] = useState("");

  const salvar = async () => {
    try {
      await updatePost(post.id, { conteudo, legenda });
      setEditing(false);
      onChange(); // recarrega os posts
    } catch (e) {
      setMsg(e.message);
    }
  };

  const apagar = async () => {
    if (!confirm("Tem certeza que deseja apagar?")) return;
    try {
      await deletePost(post.id);
      onChange(); // recarrega os posts
    } catch (e) {
      setMsg(e.message);
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));

  if (editing) {
    return (
      <div>
        <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
        <input value={legenda} onChange={(e) => setLegenda(e.target.value)} placeholder="Legenda" />
        <button onClick={salvar}>Salvar</button>
        <button onClick={() => setEditing(false)}>Cancelar</button>
        {msg && <p>{msg}</p>}
      </div>
    );
  }

  return (
    <div>
      <p>{post.conteudo}</p>
      {post.legenda && <small>{post.legenda}</small>}
      {post.user_id === user?.id && (
        <>
          <button onClick={() => setEditing(true)}>Editar</button>
          <button onClick={apagar}>Apagar</button>
        </>
      )}
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default PostItem;
