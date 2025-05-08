"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.transporter = void 0;
require("dotenv/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DomainHandler_1 = require("../DomainHandler");
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.CREDA_EMAIL,
        pass: process.env.CREDA_EMAIL_SECRET,
    },
});
const sendEmail = async ({ to, subject, user_name, user_id }) => {
    const htmlPath = path_1.default.join(__dirname, "./EmailVerification.html");
    let htmlTemplate = fs_1.default.readFileSync(htmlPath, "utf-8");
    const url = new URL(`${(0, DomainHandler_1.getDomain)()}/managers/verify-email`);
    url.searchParams.append("manager_id", user_id);
    htmlTemplate = htmlTemplate
        .replace("{{username}}", user_name)
        .replace("{{validation_link}}", url.toString());
    const info = await exports.transporter.sendMail({
        from: `"Creda Support" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html: htmlTemplate,
    });
    return info;
};
exports.sendEmail = sendEmail;
