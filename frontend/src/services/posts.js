const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const token = () => localStorage.getItem("token");

export async function updatePost(id, payload) {
  const res = await fetch(`${API}/api/posts/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${API}/api/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
