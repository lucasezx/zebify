import {
  createMessage,
  getConversation,
  markAsRead,
  listConversations,
} from "../models/messageModel.js";

export function sendMessage(io) {
  return async function (req, res) {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ error: "Dados inválidos." });
    }
    try {
      const result = await createMessage(senderId, receiverId, content);
      const message = {
        id: result.lastID,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        created_at: new Date().toISOString(),
      };
      io.to(String(receiverId)).emit("receive_message", message);
      res.status(201).json(message);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao enviar mensagem." });
    }
  };
}

export async function fetchConversation(req, res) {
  const userId = req.user.id;
  const otherId = parseInt(req.params.userId);
  try {
    const messages = await getConversation(userId, otherId);
    await markAsRead(userId, otherId);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar mensagens." });
  }
}