import { addComment, getComments, updateComment, deleteComment } from "../controllers/commentController.js";

export default function registerCommentRoutes(app, authenticateToken, io) {
  app.post("/api/comments", authenticateToken, addComment(io));
  app.get("/api/comments/:postId", getComments);
  app.put("/api/comments/:id", authenticateToken, updateComment(io));
  app.delete("/api/comments/:id", authenticateToken, deleteComment(io));
}
