import crypto from "crypto";
import "dotenv/config";

const algorithm = "aes-256-ecb";

const getSecret = (): Buffer => {
    const secret = process.env.SECRET_KEY_ENCRYPTION;
    if (!secret) throw new Error("Secret key not found. Generate one with: openssl rand -hex 32");
    return Buffer.from(secret, "hex"); 
};

export const encryptData = (data: string): string => {
    const cipher = crypto.createCipheriv(algorithm, getSecret(), null); 
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

export const decrypt = (encryptedText: string): string => {
    const decipher = crypto.createDecipheriv(algorithm, getSecret(), null);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
