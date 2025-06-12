import { updateProfile } from "../controllers/userController.js";

export default function registerUserRoutes(app, authenticateToken) {
  app.put("/api/users/update-profile", authenticateToken, updateProfile);
}
