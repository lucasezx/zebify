import { runQuery, allQuery } from "../sql.js";

export function createMessage(senderId, receiverId, content) {
  return runQuery(
    `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`,
    [senderId, receiverId, content]
  );
}

export function getConversation(userA, userB) {
  return allQuery(
    `SELECT * FROM messages
     WHERE (sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?)
     ORDER BY created_at`,
    [userA, userB, userB, userA]
  );
}

export function markAsRead(userA, userB) {
  return runQuery(
    `UPDATE messages SET read_at = datetime('now')
     WHERE receiver_id = ? AND sender_id = ? AND read_at IS NULL`,
    [userA, userB]
  );
}
