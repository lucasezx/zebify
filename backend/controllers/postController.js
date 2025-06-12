import { runQuery, allQuery } from "../sql.js";

export async function createPost(req, res) {
  const { tipo, conteudo, legenda, visibility = "public" } = req.body;
  const user_id = req.user.id;

  let imagem_path = null;
  if (tipo === "imagem" && req.file) imagem_path = req.file.filename;

  if (
    !tipo ||
    (tipo === "texto" && !conteudo) ||
    (tipo === "imagem" && !imagem_path)
  ) {
    return res.status(400).json({ error: "Dados da publicação incompletos" });
  }

  if (!["public", "friends", "private"].includes(visibility)) {
    return res.status(400).json({ error: "Visibilidade inválida." });
  }

  try {
    await runQuery(
      `INSERT INTO posts (user_id, tipo, conteudo, legenda, imagem_path, visibility) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        tipo,
        conteudo || null,
        legenda || null,
        imagem_path,
        visibility,
      ]
    );

    res.status(201).json({ message: "Publicação criada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar publicação" });
  }
}

export async function getPosts(req, res) {
  const viewerId = req.user.id;
  try {
    const posts = await allQuery(
      `
      SELECT p.*, u.first_name || ' ' || u.last_name AS author
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN friendships f ON ((f.sender_id = ? AND f.receiver_id = p.user_id) OR (f.receiver_id = ? AND f.sender_id = p.user_id)) AND f.status = 'aceito'
      WHERE p.visibility = 'public' OR p.user_id = ? OR (p.visibility = 'friends' AND f.id IS NOT NULL)
      ORDER BY p.created_at DESC
      `,
      [viewerId, viewerId, viewerId]
    );
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar posts" });
  }
}

export async function getMyPosts(req, res) {
  const userId = req.user.id;
  try {
    const posts = await allQuery(
      `SELECT p.*, u.first_name || ' ' || u.last_name AS author
   FROM posts p
   JOIN users u ON u.id = p.user_id
   WHERE p.user_id = ?
   ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar suas publicações." });
  }
}

export function updatePost(io) {
  return async function (req, res) {
    const postId = req.params.id;
    const userId = req.user.id;
    const { conteudo, legenda, visibility } = req.body;

    const [post] = await allQuery(
      "SELECT * FROM posts WHERE id=? AND user_id=?",
      [postId, userId]
    );
    if (!post) return res.status(403).json({ error: "Sem permissão" });

    await runQuery(
      "UPDATE posts SET conteudo=?, legenda=?, visibility=? WHERE id=?",
      [
        conteudo ?? post.conteudo,
        legenda ?? post.legenda,
        visibility ?? post.visibility,
        postId,
      ]
    );

    const [postAtualizado] = await allQuery(
      `SELECT p.id,
          p.conteudo,
          p.legenda,
          p.tipo,
          p.imagem_path,
          p.visibility,
          p.created_at,
          u.first_name || ' ' || u.last_name AS author
   FROM posts p
   JOIN users u ON u.id = p.user_id
   WHERE p.id = ?`,
      [postId]
    );

    io.emit("postagem_editada", postAtualizado);
    res.json(postAtualizado);
  };
}

export function deletePost(io) {
  return async function (req, res) {
    const userId = req.user.id;
    const postId = req.params.id;

    try {
      const post = await allQuery(
        `SELECT * FROM posts WHERE id = ? AND user_id = ?`,
        [postId, userId]
      );
      if (!post.length)
        return res
          .status(403)
          .json({ error: "Sem permissão para deletar este post." });

      await runQuery(`DELETE FROM posts WHERE id = ?`, [postId]);

      io.emit("postagem_deletada", Number(postId));

      res.json({ message: "Publicação deletada com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: "Erro ao apagar publicação." });
    }
  };
}
