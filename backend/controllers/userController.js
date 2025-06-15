import { runQuery } from "../sql.js";
import { getDaysInMonth } from "../utils/date.js";

export async function updateProfile(req, res) {
  const userId = req.user?.id;
  const { firstName, lastName, birthDate } = req.body;

  if (!userId || !firstName || !lastName || !birthDate) {
    return res.status(400).json({ error: "Dados inválidos." });
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

