import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { runQuery, allQuery } from "../sql.js";

const JWT_SECRET = "zebify_super_secreto";

export async function signup(req, res) {
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
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const users = await allQuery(`SELECT * FROM users WHERE email = ?`, [email]);
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
}
