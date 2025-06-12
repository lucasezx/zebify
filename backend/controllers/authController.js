import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { runQuery, allQuery } from "../sql.js";
import { sendVerificationEmail } from "../utils/email.js";

const JWT_SECRET = process.env.JWT_SECRET || "zebify_super_secreto";

export async function signup(req, res) {
  const { firstName, lastName, contact, password, gender, birthDate } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !contact ||
    !password ||
    !gender ||
    !birthDate
  ) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "A senha deve ter pelo menos 6 caracteres.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{9}$/;
  let email = null;
  let phone = null;

  if (emailRegex.test(contact)) {
    email = contact.toLowerCase();
  } else if (phoneRegex.test(contact)) {
    phone = contact;
  } else {
    return res
      .status(400)
      .json({ error: "Contacto inválido (e-mail ou 9 dígitos)" });
  }

  try {
    const existing = await allQuery(
      `SELECT id FROM users WHERE email = ? OR phone = ?`,
      [email, phone]
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "Este e-mail ou número já está em uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Envia e-mail de verificação (se for e-mail)
    if (email) {
      await sendVerificationEmail(email, verificationCode);
    }

    await runQuery(
      `INSERT INTO users (first_name, last_name, email, phone, password, gender, birth_date, verification_code, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        email,
        phone,
        hashedPassword,
        gender,
        birthDate,
        verificationCode,
        0,
      ]
    );

    res.status(201).json({
      message: "Utilizador cadastrado com sucesso! Verifique sua conta.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar utilizador" });
  }
}

export async function login(req, res) {
  const { contact, password } = req.body;

  if (!contact || !password) {
    return res
      .status(400)
      .json({ error: "Contacto e senha são obrigatórios!" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const query = emailRegex.test(contact)
    ? `SELECT * FROM users WHERE email = ?`
    : `SELECT * FROM users WHERE phone = ?`;

  try {
    const users = await allQuery(query, [contact]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: "Utilizador não encontrado" });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        error: "Conta ainda não verificada. Verifique seu e-mail ou SMS.",
      });
    }

    const senhaOk = await bcrypt.compare(password, user.password);
    if (!senhaOk) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.first_name,
        contact: user.email || user.phone,
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
        contact: user.email || user.phone,
        birth_date: user.birth_date,
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
  const campo = emailRegex.test(contact) ? "email" : "phone";

  try {
    const users = await allQuery(`SELECT * FROM users WHERE ${campo} = ?`, [
      contact,
    ]);
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
