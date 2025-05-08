import crypto from "crypto";
import "dotenv/config";

const algorithm = "aes-256-cbc";

const getSecret = (): Buffer => {
    const secret = process.env.SECRET_KEY_ENCRYPTION;
    if (!secret) {
        throw new Error(
            "Secret key not found. Generate one with: openssl rand -hex 32"
        );
    }
    return Buffer.from(secret, "hex"); 
};

export const encryptData = (data: string): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, getSecret(), iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedText: string): string => {
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, getSecret(), iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};
