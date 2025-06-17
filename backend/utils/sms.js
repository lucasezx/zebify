import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendVerificationSMS(to, code) {
  try {
    const number = to.startsWith("+") ? to : `+351${to}`;
    await client.messages.create({
      body: `Seu código de verificação Zebify: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: number,
    });
  } catch (error) {
    console.error("Erro ao enviar SMS:", error.message);
  }
}
