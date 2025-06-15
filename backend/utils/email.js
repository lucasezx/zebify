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
    subject: "🔐 Verificação de Conta - Zebify",
    text: `Olá!

Recebemos um pedido para verificar sua conta na Zebify.

Seu código de verificação é: ${code}

Se você não fez essa solicitação, por favor ignore este e-mail.

Obrigado,
Equipe Zebify`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 24px; border-radius: 8px; color: #333; max-width: 500px; margin: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #2e7d32;">Zebify - Verificação de Conta</h2>
        <p>Olá!</p>
        <p>Recebemos um pedido para verificar sua conta na <strong>Zebify</strong>.</p>
        <p>Utilize o código abaixo para concluir a verificação:</p>
        <div style="background-color: #e8f5e9; padding: 16px; text-align: center; border-radius: 4px; margin: 16px 0; font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #2e7d32;">
          ${code}
        </div>
        <p>Se você não fez essa solicitação, pode ignorar este e-mail com segurança.</p>
        <p style="margin-top: 32px;">Atenciosamente,<br><strong>Equipe Zebify</strong></p>
      </div>
    `,
  });
}
