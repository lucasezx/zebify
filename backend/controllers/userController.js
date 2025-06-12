import { runQuery } from "../sql.js";

export async function updateProfile(req, res) {
  const userId = req.user?.id;
  const { firstName, lastName, birthDate } = req.body;

  if (!userId || !firstName || !lastName || !birthDate) {
    return res.status(400).json({ error: "Dados inválidos." });
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
