import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar_url: user.avatar_url,
      birth_date: user.birth_date,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
