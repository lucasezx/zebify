import { createMessage, markAsRead } from "../models/messageModel.js";

const onlineUsers = new Map();

export default function messageHandler(io, socket) {
  socket.on("login", (userId) => {
    if (!userId) {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("user_offline", socket.userId);
      }
      socket.userId = null;
      return;
    }

    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    socket.join(String(userId));
    socket.emit("online_users", Array.from(onlineUsers.keys()));
    io.emit("user_online", userId);
  });

    socket.on("send_message", async ({ receiverId, content }) => {
      const senderId = socket.userId;
      if (!senderId || !receiverId || !content || Number(receiverId) === senderId) return;
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
      socket.emit("message_sent", message);
    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
  });

  socket.on("mark_read", async (otherId) => {
    if (!socket.userId) return;
    await markAsRead(socket.userId, otherId);
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("user_offline", socket.userId);
    }
  });
}
