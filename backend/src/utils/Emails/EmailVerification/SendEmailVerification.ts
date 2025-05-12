import "dotenv/config"
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { getDomain } from "../../DomainHandler";


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.CREDA_EMAIL,
    pass: process.env.CREDA_EMAIL_SECRET,
  },
}); 

export const sendEmail = async ({
  to,
  subject,
  user_name,
  user_id
}: {
  to: string;
  subject: string;
  user_name: string
  user_id: string
}) => {
  const htmlPath = path.join(__dirname, "./EmailVerification.html")

  let htmlTemplate = fs.readFileSync(htmlPath, "utf-8")

  const url = new URL(`${getDomain()}/managers/verify-email`);
  url.searchParams.append("manager_id", user_id);

  htmlTemplate = htmlTemplate
    .replace("{{username}}", user_name)
    .replace("{{validation_link}}", url.toString());

  const info = await transporter.sendMail({
    from: `"Creda Support" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: htmlTemplate,
  });

  return info;
};
