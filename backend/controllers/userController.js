import { runQuery, allQuery } from "../sql.js";
import { getDaysInMonth } from "../utils/date.js";
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
          first_name  AS firstName,
          last_name   AS lastName,
          email,
          avatar_url  AS avatar_url,
          birth_date  AS birth_date
   FROM users
   WHERE id = ?`,
      [userId]
    );
    res.json(user);
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
          first_name  AS firstName,
          last_name   AS lastName,
          email,
          avatar_url  AS avatar_url,
          birth_date  AS birth_date
   FROM users
   WHERE id = ?`,
      [userId]
    );
    res.json(user);
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
      `UPDATE users SET first_name = ?, last_name = ?, birth_date = ? WHERE id = ?`,
      [firstName, lastName, birthDate, userId]
    );
    res.json({ message: "Perfil atualizado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
}
