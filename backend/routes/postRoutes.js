import {
  createPost,
  getPosts,
  getMyPosts,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

export default function registerPostRoutes(app, authenticateToken, upload, io) {
  app.post(
    "/api/posts",
    authenticateToken,
    upload.single("imagem"),
    createPost
  );
  app.get("/api/posts", authenticateToken, getPosts);
  app.get("/api/my-posts", authenticateToken, getMyPosts);
  app.put("/api/posts/:id", authenticateToken, updatePost(io));
  app.delete("/api/posts/:id", authenticateToken, deletePost(io));
}
