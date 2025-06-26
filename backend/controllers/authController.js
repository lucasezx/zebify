import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { runQuery, allQuery } from "../sql.js";
import { sendVerificationEmail } from "../utils/email.js";

const JWT_SECRET = process.env.JWT_SECRET || "zebify_super_secreto";

export async function signup(req, res) {
  console.log("BODY RECEBIDO:", req.body);
  const { firstName, lastName, contact, password, gender, birthDate } = req.body;

  if (!firstName || !lastName || !contact || !password || !gender || !birthDate) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const birth = new Date(birthDate);
  const isValidDate =
    birth instanceof Date &&
    !isNaN(birth.getTime()) &&
    birth.toISOString().slice(0, 10) === birthDate;

  if (!isValidDate) {
    return res.status(400).json({ error: "Data de nascimento inválida." });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "A palavra-passe deve ter, no mínimo, 6 caracteres.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact)) {
    return res.status(400).json({ error: "Insira um e-mail válido" });
  }

  const email = contact.toLowerCase();

  try {
    const existing = await allQuery(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "Este e-mail já está em uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await sendVerificationEmail(email, verificationCode);

    await runQuery(
      `INSERT INTO users (first_name, last_name, email, password, gender, birth_date, verification_code, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        email,
        hashedPassword,
        gender,
        birthDate,
        verificationCode,
        0,
      ]
    );

    res.status(201).json({
      message: "Utilizador registado com sucesso! Verifique sua conta.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registar utilizador" });
  }
}

export async function login(req, res) {
  const { contact, password } = req.body;

  if (!contact || !password) {
    return res
      .status(400)
      .json({ error: "E-mail e palavra-passe são obrigatórios!" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact)) {
    return res.status(400).json({ error: "E-mail inválido" });
  }

  try {
    const users = await allQuery(`SELECT * FROM users WHERE email = ?`, [contact]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: "Utilizador não encontrado" });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        error: "Conta ainda não verificada. Verifique seu e-mail.",
      });
    }

    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) {
      return res.status(401).json({ error: "Palavra-passe incorreta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.first_name,
        contact: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login bem-sucedido",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        contact: user.email,
        birth_date: user.birth_date,
        avatar_url: user.avatar_url,
        name: `${user.first_name} ${user.last_name}`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no login" });
  }
}

export async function verifyCode(req, res) {
  const { contact, code } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact)) {
    return res.status(400).json({ error: "E-mail inválido." });
  }

  try {
    const users = await allQuery(`SELECT * FROM users WHERE email = ?`, [contact]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    if (user.is_verified) {
      return res
        .status(400)
        .json({ error: "Conta já foi verificada anteriormente." });
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ error: "Código incorreto." });
    }

    await runQuery(
      `UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?`,
      [user.id]
    );

    res.json({ message: "Conta verificada com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao verificar código." });
  }
}