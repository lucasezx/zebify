import express from "express";
import cors from "cors";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { createTables, runQuery, allQuery } from "./sql.js";

const app = express();
const port = 3001;
const JWT_SECRET = "zebify_super_secreto";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

createTables();

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
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
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

    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

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

app.post("/posts", authenticateToken, async (req, res) => {
  const { tipo, conteudo, legenda, imagem_path } = req.body;
  const user_id = req.user.id;

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
      [user_id, tipo, conteudo || null, legenda || null, imagem_path || null]
    );
    res.status(201).json({ message: "Publicação criada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar publicação" });
  }
});

app.get("/posts", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

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
