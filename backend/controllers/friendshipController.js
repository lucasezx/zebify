import { runQuery, allQuery } from "../sql.js";

export async function requestFriend(req, res) {
  const senderId = req.user.id;
  const { receiverId } = req.body;

  if (!receiverId || senderId === receiverId) {
    return res.status(400).json({ error: "Pedido inválido." });
  }

  try {
    const existentes = await allQuery(
      `SELECT * FROM friendships WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
      [senderId, receiverId, receiverId, senderId]
    );

    if (existentes.length > 0) {
      return res.status(409).json({ error: "Já existe pedido ou amizade entre os utilizadores." });
    }

    await runQuery(
      `INSERT INTO friendships (sender_id, receiver_id, status) VALUES (?, ?, 'pendente')`,
      [senderId, receiverId]
    );

    res.status(201).json({ message: "Pedido de amizade enviado!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao enviar pedido de amizade." });
  }
}

export function acceptFriend(io) {
  return async function (req, res) {
    const receiverId = req.user.id;
    const { senderId } = req.body;

    try {
      const pedido = await allQuery(
        `SELECT * FROM friendships WHERE sender_id = ? AND receiver_id = ? AND status = 'pendente'`,
        [senderId, receiverId]
      );

      if (pedido.length === 0) {
        return res.status(404).json({ error: "Pedido de amizade não encontrado." });
      }

      await runQuery(
        `UPDATE friendships SET status = 'aceito' WHERE sender_id = ? AND receiver_id = ?`,
        [senderId, receiverId]
      );

      io.emit("amizade_aceita", { userId1: senderId, userId2: receiverId });
      io.emit("atualizar_feed");

      res.json({ message: "Pedido de amizade aceito!" });
    } catch (err) {
      res.status(500).json({ error: "Erro ao aceitar pedido de amizade." });
    }
  };
}

export async function listFriends(req, res) {
  const userId = req.user.id;

  try {
    const amigos = await allQuery(
      `SELECT u.id, u.name, u.email FROM users u JOIN friendships f ON ((f.sender_id = ? AND f.receiver_id = u.id) OR (f.receiver_id = ? AND f.sender_id = u.id)) WHERE f.status = 'aceito'`,
      [userId, userId]
    );

    res.json(amigos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar amigos." });
  }
}

export async function listFriendRequests(req, res) {
  const userId = req.user.id;

  try {
    const pedidos = await allQuery(
      `SELECT f.sender_id AS id, u.name, u.email FROM friendships f JOIN users u ON f.sender_id = u.id WHERE f.receiver_id = ? AND f.status = 'pendente'`,
      [userId]
    );

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedidos de amizade." });
  }
}

export async function listUsers(req, res) {
  try {
    const users = await allQuery(`SELECT id, name, email FROM users`);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar utilizadores." });
  }
}

export async function listUsersWithStatus(req, res) {
  const userId = req.user.id;

  try {
    const users = await allQuery(
      `SELECT u.id, u.name, u.email, CASE WHEN f1.status = 'aceito' THEN 'amigos' WHEN f1.status = 'pendente' AND f1.sender_id = ? THEN 'pendente' WHEN f1.status = 'pendente' AND f1.receiver_id = ? THEN 'recebido' ELSE 'nenhum' END AS status FROM users u LEFT JOIN friendships f1 ON ((f1.sender_id = u.id AND f1.receiver_id = ?) OR (f1.sender_id = ? AND f1.receiver_id = u.id)) WHERE u.id != ?`,
      [userId, userId, userId, userId, userId]
    );

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar utilizador com status." });
  }
}

export async function rejectFriend(req, res) {
  const receiverId = req.user.id;
  const { senderId } = req.body;

  try {
    const pedido = await allQuery(
      `SELECT * FROM friendships WHERE sender_id = ? AND receiver_id = ? AND status = 'pendente'`,
      [senderId, receiverId]
    );

    if (!pedido.length) {
      return res.status(404).json({ error: "Pedido de amizade não encontrado." });
    }

    await runQuery(
      `DELETE FROM friendships WHERE sender_id = ? AND receiver_id = ? AND status = 'pendente'`,
      [senderId, receiverId]
    );

    res.json({ message: "Pedido de amizade recusado." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao recusar pedido de amizade." });
  }
}

export function removeFriend(io) {
  return async function (req, res) {
    const userId = req.user.id;
    const otherId = req.params.id;

    try {
      const amizade = await allQuery(
        `SELECT * FROM friendships WHERE status = 'aceito' AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))`,
        [userId, otherId, otherId, userId]
      );

      if (!amizade.length) {
        return res.status(404).json({ error: "Amizade não encontrada." });
      }

      await runQuery(
        `DELETE FROM friendships WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
        [userId, otherId, otherId, userId]
      );

      io.emit("amizade_removida", { userId1: userId, userId2: otherId });
      io.emit("atualizar_feed");

      res.json({ message: "Amizade removida com sucesso." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao remover amizade." });
    }
  };
}

export async function cancelRequest(req, res) {
  const senderId = req.user.id;
  const receiverId = req.params.id;

  try {
    const pedido = await allQuery(
      `SELECT * FROM friendships WHERE sender_id = ? AND receiver_id = ? AND status = 'pendente'`,
      [senderId, receiverId]
    );

    if (!pedido.length) {
      return res.status(404).json({ error: "Pedido de amizade não encontrado." });
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
}
