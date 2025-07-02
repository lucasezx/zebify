import { runQuery, allQuery } from "../sql.js";
import { getDaysInMonth } from "../utils/date.js";
import { generateToken } from "../utils/jwt.js";
import path from "path";

export async function uploadAvatar(req, res) {
  const userId = req.user?.id;
  if (!userId || !req.file)
    return res.status(400).json({ error: "Arquivo ausente." });

  try {
    await runQuery("UPDATE users SET avatar_url = ? WHERE id = ?", [
      req.file.filename,
      userId,
    ]);
    const [user] = await allQuery(
      `SELECT id,
          first_name  AS "firstName",
          last_name   AS "lastName",
          email,
          avatar_url  AS avatar_url,
          birth_date  AS birth_date
   FROM users
   WHERE id = ?`,
      [userId]
    );
    req.app.get("io")?.emit("profileUpdated", user);
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falha ao salvar avatar." });
  }
}

export async function removeAvatar(req, res) {
  const userId = req.user?.id;
  try {
    await runQuery("UPDATE users SET avatar_url = NULL WHERE id = ?", [userId]);
    const [user] = await allQuery(
      `SELECT id,
          first_name  AS "firstName",
          last_name   AS "lastName",
          email,
          avatar_url  AS avatar_url,
          birth_date  AS birth_date
   FROM users
   WHERE id = ?`,
      [userId]
    );
    const token = generateToken(user);
    req.app.get("io")?.emit("profileUpdated", user);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover avatar." });
  }
}

export async function updateProfile(req, res) {
  const userId = req.user?.id;
  const { firstName, lastName, birthDate } = req.body;

  if (!userId || !firstName || !lastName || !birthDate) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  if (firstName.length > 50 || lastName.length > 50) {
    return res
      .status(400)
      .json({ error: "Nome ou apelido excede 50 caracteres." });
  }

  const [anoStr, mesStr, diaStr] = birthDate.split("-");
  const ano = parseInt(anoStr);
  const mes = parseInt(mesStr);
  const dia = parseInt(diaStr);

  if (isNaN(ano) || isNaN(mes) || isNaN(dia)) {
    return res.status(400).json({ error: "Data de nascimento inválida." });
  }

  const maxDia = getDaysInMonth(ano, mes);
  if (dia < 1 || dia > maxDia) {
    return res.status(400).json({ error: "Data de nascimento inválida." });
  }

  try {
    await runQuery(
      "UPDATE users SET first_name = ?, last_name = ?, birth_date = ? WHERE id = ?",
      [firstName, lastName, birthDate, userId]
    );

    const [user] = await allQuery(
      `SELECT id,
          first_name AS "firstName",
          last_name  AS "lastName",
          email,
          avatar_url,
          birth_date
   FROM users
   WHERE id = ?`,
      [userId]
    );

    const io = req.app.get("io");
    io?.emit("profileUpdated", user);

    res.json({ message: "Perfil atualizado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
}

export async function getUserById(req, res) {
  const id = req.params.id;
  const viewerId = req.user?.id;

  try {
    const [user] = await allQuery(
      `
      SELECT u.id,
             u.first_name             AS "firstName",
             u.last_name              AS "lastName",
             u.avatar_url,
             u.created_at,
             CASE
               WHEN f.status = 'aceito' THEN 'amigos'
               WHEN f.status = 'pendente' AND f.sender_id   = ? THEN 'pendente'
               WHEN f.status = 'pendente' AND f.receiver_id = ? THEN 'recebido'
               ELSE 'nenhum'
             END                       AS "friendshipStatus"
      FROM   users u
      LEFT   JOIN friendships f
             ON ((f.sender_id = u.id AND f.receiver_id = ?)
              OR (f.sender_id = ?    AND f.receiver_id = u.id))
      WHERE  u.id = ?`,
      [viewerId, viewerId, viewerId, viewerId, id]
    );

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar utilizador." });
  }
}
