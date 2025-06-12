import { runQuery, allQuery } from "../sql.js";

export function addComment(io) {
  return async function (req, res) {
    const { postId, conteudo } = req.body;
    const userId = req.user.id;

    if (!postId || !conteudo) {
      return res.status(400).json({ error: "Comentário inválido." });
    }

    try {
      const userInfo = await allQuery(
        `SELECT first_name, last_name FROM users WHERE id = ?`,
        [userId]
      );

      const result = await runQuery(
        `INSERT INTO comments (post_id, user_id, conteudo) VALUES (?, ?, ?)`,
        [postId, userId, conteudo]
      );

      const fullName = userInfo.length
        ? `${userInfo[0].first_name} ${userInfo[0].last_name}`
        : "Usuário";

      const novoComentario = {
        id: result.lastID,
        postId,
        conteudo,
        user_id: userId,
        user_name: fullName,
        created_at: new Date().toISOString(),
      };

      io.emit("newComment", novoComentario);
      res.status(201).json({ message: "Comentário adicionado!" });
    } catch (err) {
      console.error("Erro ao comentar:", err);
      res.status(500).json({ error: "Erro ao comentar." });
    }
  };
}

export async function getComments(req, res) {
  const { postId } = req.params;
  try {
    const comentarios = await allQuery(
      `SELECT c.*, u.first_name || ' ' || u.last_name AS autor
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC`,

      [postId]
    );
    res.json(comentarios);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar comentários." });
  }
}

export function updateComment(io) {
  return async function (req, res) {
    const userId = req.user.id;
    const commentId = req.params.id;
    const { conteudo } = req.body;

    const [own] = await allQuery(
      "SELECT * FROM comments WHERE id = ? AND user_id = ?",
      [commentId, userId]
    );
    if (!own) return res.status(403).json({ error: "Sem permissão" });

    await runQuery("UPDATE comments SET conteudo = ? WHERE id = ?", [
      conteudo,
      commentId,
    ]);

    const [comentario] = await allQuery(
      `SELECT c.*, u.first_name || ' ' || u.last_name AS autor FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [commentId]
    );

    io.emit("comentario_editado", comentario);
    res.json(comentario);
  };
}

export function deleteComment(io) {
  return async function (req, res) {
    const userId = req.user.id;
    const commentId = req.params.id;

    try {
      const [comment] = await allQuery(
        `SELECT * FROM comments WHERE id = ? AND user_id = ?`,
        [commentId, userId]
      );

      if (!comment) {
        return res.status(403).json({ error: "Sem permissão para deletar." });
      }

      await runQuery(`DELETE FROM comments WHERE id = ?`, [commentId]);

      io.emit("comentario_deletado", comment.id);

      res.json({ message: "Comentário deletado com sucesso." });
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
      res.status(500).json({ error: "Erro ao deletar comentário." });
    }
  };
}
