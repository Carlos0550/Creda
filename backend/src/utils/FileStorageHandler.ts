import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
const UploadsFolder = path.join(__dirname, "../uploads");

if (!fs.existsSync(UploadsFolder)) {
    fs.mkdirSync(UploadsFolder);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UploadsFolder);
    },
    filename: function (req, file, cb) {
        cb(null, randomUUID() + "-" + file.originalname);
    },
});

export const RollbackFile = (fileName: string): boolean => {
    const filePath = path.join(__dirname, "../uploads/" + fileName);
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("Archivo eliminado:", filePath);
            return true
        };
        return false
    } catch (error) {
        return false
    }
}

export const upload = multer({ storage: storage });