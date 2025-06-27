import { updateProfile, uploadAvatar, removeAvatar, getUserById } from "../controllers/userController.js";

export default function registerUserRoutes(app, authenticateToken, upload) {
  app.put("/api/users/update-profile", authenticateToken, updateProfile);
  app.put(
    "/api/users/avatar",
    authenticateToken,
    upload.single("avatar"),
    uploadAvatar
  );

  app.delete("/api/users/avatar", authenticateToken, removeAvatar);
  app.get("/api/users/:id", authenticateToken, getUserById);
}
