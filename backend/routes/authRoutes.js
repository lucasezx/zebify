import { signup, login, verifyCode } from "../controllers/authController.js";

export default function registerAuthRoutes(app) {
  app.post("/signup", signup);
  app.post("/login", login);
  app.post("/verify", verifyCode);
}
