import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to, code) {
  await transporter.sendMail({
    from: `"Zebify" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Confirmação de conta Zebify",
    text: `Seu código de verificação é: ${code}`,
    html: `<p>Seu código de verificação é: <strong>${code}</strong></p>`,
  });
}
