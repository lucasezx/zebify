import { signup, login } from "../controllers/authController.js";

export default function registerAuthRoutes(app) {
  app.post("/signup", signup);
  app.post("/login", login);
}
