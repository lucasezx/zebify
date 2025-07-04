import {
  sendMessage,
  fetchConversation,
  fetchConversations,
} from "../controllers/messagesController.js";

export default function registerMessageRoutes(app, authenticateToken, io) {
  app.post("/api/messages", authenticateToken, sendMessage(io));
  app.get("/api/messages", authenticateToken, fetchConversations);
  app.get("/api/messages/:userId", authenticateToken, fetchConversation);
}
