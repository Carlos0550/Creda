import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import Redis from "ioredis";

const redis = new Redis({
    host: "localhost",
    port: 6379
});

redis.on('error', (err: Error) => {
    console.error('❌ Redis error:', err);
    process.exit(1);
});

export async function saveFile(req: Request, res: Response) {
    const fileName = req.file?.filename;
    const { userId } = req.body;

    if (!fileName || !userId) {
        res.status(400).json({
            msg: "Faltan datos: se requiere un archivo válido y el userId."
        });
        return
    }

    try {
        console.log("Agregando nuevo archivo a Redis pendiente de análisis...");
        await redis.sadd("files:pending", fileName);

        const metadataKey = `filedata:${fileName}`;
        await redis.hset(metadataKey, {
            userId,
            status: "pending"
        });

        console.log("Archivo pendiente de análisis agregado...");

        res.status(200).json({
            msg: "Archivo encolado, espere unos segundos..."
        });
        return

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error interno del servidor, no fue posible comenzar el análisis."
        });
        return
    }
}

export async function verifyFileState(req: Request, res: Response) {
    const { status, userId } = req.query;

    if (!status || typeof status !== "string") {
        res.status(400).json({
            msg: "Falta el parámetro obligatorio 'status'."
        });
        return
    }

    try {
        const redisKey = `files:${status}`;
        const files = await redis.smembers(redisKey);

        if (!files.length) {
            res.status(404).json({
                msg: `No se encontraron archivos con el estado '${status}'`
            });
            return
        }

        // Si no se envió userId, devolvemos todo
        if (!userId) {
            res.status(200).json({
                status,
                archivos: files.map(file => ({ file }))
            });
            return
        }

        // Filtrar por userId
        const userFiles: { file: string, columns?: string[] }[] = [];

        for (const file of files) {
            const metadataKey = `filedata:${file}`;
            const metadata = await redis.hgetall(metadataKey);

            if (metadata.userId === userId) {
                userFiles.push({
                    file,
                    columns: metadata.columns ? JSON.parse(metadata.columns) : undefined
                });
            }
        }

        res.status(200).json({
            status,
            archivos: userFiles
        });
        return

    } catch (error) {
        console.error("Error verificando estado de archivos:", error);
        res.status(500).json({
            msg: "Error interno del servidor al verificar el estado de los archivos"
        });
        return
    }
}

//obtienew archivos pendientes de analisis y los bloquea 
export async function getAndLockPendingFile(req: Request, res: Response) {
    try {
        const file = await redis.spop("files:pending");

        if (!file) {
             res.status(404).json({
                msg: "No hay archivos pendientes."
            });
            return
        }

        await redis.sadd("files:locked", file);

        const metadataKey = `filedata:${file}`;
        await redis.hset(metadataKey, "status", "locked");

        res.status(200).json({ file });
        return
    } catch (error) {
        console.error("Error al obtener archivo pendiente:", error);
         res.status(500).json({ msg: "Error interno del servidor" });
         return
    }
}

//Recibe las columnas, marca archivos bloqueados a ya analizados con sus columnas
export async function markFilesAsAnalyzed(req: Request, res: Response) {
    const { fileName, columns } = req.body;

    if (!fileName || !Array.isArray(columns)) {
         res.status(400).json({
            msg: "Faltan datos: se requiere 'fileName' y un array 'columns'."
        });
        return
    }

    try {
        await redis.srem("files:locked", fileName);
        await redis.sadd("files:analyzed", fileName);

        const metadataKey = `filedata:${fileName}`;
        await redis.hset(metadataKey, {
            status: "analyzed",
            columns: JSON.stringify(columns)
        });

        res.sendStatus(204);
        return
    } catch (error) {
        console.error("Error al marcar archivo como analizado:", error);
        res.status(500).json({
            msg: "Error interno al marcar archivo como analizado."
        });

        return
    }
}
