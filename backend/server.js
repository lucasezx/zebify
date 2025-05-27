import express from "express";
import cors from "cors";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";

import { createTables, runQuery, allQuery } from "./sql.js";

const app = express();
const port = 3001;
const JWT_SECRET = "zebify_super_secreto";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

createTables();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get("/", (req, res) => {
  res.send("API do Zebify está funcionando!");
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await runQuery(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: "Utilizador cadastrado com sucesso!" });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      res.status(409).json({ error: "Email já está em uso" });
    } else {
      console.error(error);
      res.status(500).json({ error: "Erro ao cadastrar" });
    }
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await allQuery(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    const user = users[0];

    if (!user)
      return res.status(401).json({ error: "Utilizador não encontrado" });

    const senhaConfere = await bcrypt.compare(password, user.password);
    if (!senhaConfere)
      return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login bem-sucedido",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no login" });
  }
});

app.post(
  "/api/posts",
  authenticateToken,
  upload.single("imagem"),
  async (req, res) => {
    const { tipo, conteudo, legenda } = req.body;
    const user_id = req.user.id;

    let imagem_path = null;
    if (tipo === "imagem" && req.file) {
      imagem_path = req.file.filename;
    }

    if (
      !tipo ||
      (tipo === "texto" && !conteudo) ||
      (tipo === "imagem" && !imagem_path)
    ) {
      return res.status(400).json({ error: "Dados da publicação incompletos" });
    }

    try {
      await runQuery(
        `INSERT INTO posts (user_id, tipo, conteudo, legenda, imagem_path)
       VALUES (?, ?, ?, ?, ?)`,
        [user_id, tipo, conteudo || null, legenda || null, imagem_path]
      );
      res.status(201).json({ message: "Publicação criada com sucesso!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar publicação" });
    }
  }
);

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await allQuery(`
      SELECT posts.*, users.name AS author
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar posts" });
  }
});

app.get("/api/my-posts", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const posts = await allQuery(
      `
      SELECT * FROM posts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      [userId]
    );
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar suas publicações." });
  }
});

app.put("/api/posts/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;
  const { conteudo, legenda } = req.body;

  try {
    const post = await allQuery(
      `SELECT * FROM posts WHERE id = ? AND user_id = ?`,
      [postId, userId]
    );
    if (!post.length)
      return res
        .status(403)
        .json({ error: "Sem permissão para editar este post." });

    await runQuery(
      `
      UPDATE posts SET conteudo = ?, legenda = ? WHERE id = ?
    `,
      [conteudo, legenda, postId]
    );

    res.json({ message: "Publicação atualizada com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar publicação." });
  }
});

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
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
    res.json({ message: "Publicação deletada com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao apagar publicação." });
  }
});

app.post("/api/friends/request", authenticateToken, async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.body;

  if (!receiverId || senderId === receiverId) {
    return res.status(400).json({ error: "Pedido inválido." });
  }

  try {
    // Verifica se já existe amizade ou pedido
    const existentes = await allQuery(
      `SELECT * FROM friendships
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)`,
      [senderId, receiverId, receiverId, senderId]
    );

    if (existentes.length > 0) {
      return res
        .status(409)
        .json({ error: "Já existe pedido ou amizade entre os utilizadores." });
    }

    await runQuery(
      `INSERT INTO friendships (sender_id, receiver_id, status)
       VALUES (?, ?, 'pendente')`,
      [senderId, receiverId]
    );

    res.status(201).json({ message: "Pedido de amizade enviado!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao enviar pedido de amizade." });
  }
});

app.post("/api/friends/accept", authenticateToken, async (req, res) => {
  const receiverId = req.user.id;
  const { senderId } = req.body;

  try {
    const pedido = await allQuery(
      `SELECT * FROM friendships WHERE sender_id = ? AND receiver_id = ? AND status = 'pendente'`,
      [senderId, receiverId]
    );

    if (pedido.length === 0) {
      return res
        .status(404)
        .json({ error: "Pedido de amizade não encontrado." });
    }

    await runQuery(
      `UPDATE friendships SET status = 'aceito' WHERE sender_id = ? AND receiver_id = ?`,
      [senderId, receiverId]
    );

    res.json({ message: "Pedido de amizade aceito!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao aceitar pedido de amizade." });
  }
});

app.get("/api/friends", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const amigos = await allQuery(
      `
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN friendships f ON (
        (f.sender_id = ? AND f.receiver_id = u.id)
        OR (f.receiver_id = ? AND f.sender_id = u.id)
      )
      WHERE f.status = 'aceito'
      `,
      [userId, userId]
    );

    res.json(amigos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar amigos." });
  }
});

app.get("/api/friends/requests", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const pedidos = await allQuery(
      `
      SELECT f.sender_id AS id, u.name, u.email
      FROM friendships f
      JOIN users u ON f.sender_id = u.id
      WHERE f.receiver_id = ? AND f.status = 'pendente'
      `,
      [userId]
    );

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedidos de amizade." });
  }
});

app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await allQuery(`SELECT id, name, email FROM users`);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar utilizadores." });
  }
});

app.get("/api/users/with-status", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const users = await allQuery(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        CASE
          WHEN f1.status = 'aceito' THEN 'amigos'
          WHEN f1.status = 'pendente' AND f1.sender_id = ? THEN 'pendente'
          WHEN f1.status = 'pendente' AND f1.receiver_id = ? THEN 'recebido'
          ELSE 'nenhum'
        END AS status
      FROM users u
      LEFT JOIN friendships f1 ON (
        (f1.sender_id = u.id AND f1.receiver_id = ?)
        OR (f1.sender_id = ? AND f1.receiver_id = u.id)
      )
      WHERE u.id != ?
      `,
      [userId, userId, userId, userId, userId]
    );

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar utilizador com status." });
  }
});

app.delete("/api/friends/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const otherId = req.params.id;

  try {
    const amizade = await allQuery(
      `SELECT * FROM friendships
       WHERE status = 'aceito'
       AND (
         (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
       )`,
      [userId, otherId, otherId, userId]
    );

    if (!amizade.length) {
      return res.status(404).json({ error: "Amizade não encontrada." });
    }

    await runQuery(
      `DELETE FROM friendships
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)`,
      [userId, otherId, otherId, userId]
    );

    res.json({ message: "Amizade removida com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover amizade." });
  }
});

app.delete("/api/friends/request/:id", authenticateToken, async (req, res) => {
  const senderId = req.user.id;
  const receiverId = req.params.id;

  try {
    const pedido = await allQuery(
      `SELECT * FROM friendships
       WHERE sender_id = ? AND receiver_id = ? AND status = 'pendente'`,
      [senderId, receiverId]
    );

    if (!pedido.length) {
      return res
        .status(404)
        .json({ error: "Pedido de amizade não encontrado." });
    }

    await runQuery(
      `DELETE FROM friendships WHERE sender_id = ? AND receiver_id = ? AND status = 'pendente'`,
      [senderId, receiverId]
    );

    res.json({ message: "Pedido de amizade cancelado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cancelar pedido de amizade." });
  }
});

app.post("/api/friends/reject", authenticateToken, async (req, res) => {
  const receiverId = req.user.id;
  const { senderId } = req.body;

  try {
    const pedido = await allQuery(
      `SELECT * FROM friendships
       WHERE sender_id = ? AND receiver_id = ? AND status = 'pendente'`,
      [senderId, receiverId]
    );

    if (!pedido.length) {
      return res
        .status(404)
        .json({ error: "Pedido de amizade não encontrado." });
    }

    await runQuery(
      `DELETE FROM friendships
       WHERE sender_id = ? AND receiver_id = ? AND status = 'pendente'`,
      [senderId, receiverId]
    );

    res.json({ message: "Pedido de amizade recusado." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao recusar pedido de amizade." });
  }
});

app.post("/api/comments", authenticateToken, async (req, res) => {
  const { postId, conteudo } = req.body;
  const userId = req.user.id;

  if (!postId || !conteudo) {
    return res.status(400).json({ error: "Comentário inválido." });
  }

  try {
    await runQuery(
      `INSERT INTO comments (post_id, user_id, conteudo) VALUES (?, ?, ?)`,
      [postId, userId, conteudo]
    );
    res.status(201).json({ message: "Comentário adicionado!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao comentar." });
  }
});

app.get("/api/comments/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const comentarios = await allQuery(
      `SELECT c.*, u.name AS autor
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
});

app.put("/api/comments/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const commentId = req.params.id;
  const { conteudo } = req.body;

  try {
    const [comment] = await allQuery(
      `SELECT * FROM comments WHERE id = ? AND user_id = ?`,
      [commentId, userId]
    );

    if (!comment) {
      return res.status(403).json({ error: "Sem permissão para editar." });
    }

    await runQuery(`UPDATE comments SET conteudo = ? WHERE id = ?`, [
      conteudo,
      commentId,
    ]);

    res.json({ message: "Comentário editado com sucesso." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar comentário." });
  }
});

app.delete("/api/comments/:id", authenticateToken, async (req, res) => {
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

    res.json({ message: "Comentário deletado com sucesso." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar comentário." });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
