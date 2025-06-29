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

export function listConversations(userId) {
  return allQuery(
    `SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        MAX(m.created_at) AS last_time,
        SUM(
          CASE WHEN m.receiver_id = ?
                AND m.read_at IS NULL
                AND m.sender_id = u.id
          THEN 1 ELSE 0 END
        ) AS unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = ? OR m.receiver_id = ?
      GROUP BY u.id
      ORDER BY last_time DESC`,
    [userId, userId, userId, userId]
  );
}