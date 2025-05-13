import pool from "../../connections/database_conn";
import { randomUUID } from "crypto";

const getRandomCreditScore = () => Number((Math.random() * 1000).toFixed(2));
const getRandomCreditStatus = (): 'good' | 'bad' =>
    Math.random() < 0.5 ? 'good' : 'bad';

export const insertBulkClients = async (total: number, batchSize: number = 500): Promise<boolean> => {
    try {
        for (let offset = 0; offset < total; offset += batchSize) {
            const values: any[] = [];
            const placeholders: string[] = [];

            for (let i = 0; i < batchSize && offset + i < total; i++) {
                const id = randomUUID();
                const score = getRandomCreditScore();
                const status = getRandomCreditStatus();

                const baseIndex = i * 3;
                values.push(id, score, status);
                placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`);
            }

            const query = `
                INSERT INTO clients (client_id, client_credit_scoring, client_credit_status)
                VALUES ${placeholders.join(', ')};
            `;

            await pool.query(query, values);
            console.log(`✅ Insertados ${Math.min(batchSize, total - offset)} clientes (lote ${offset / batchSize + 1})`);
        }

        console.log(`✅ Insertados ${total} clientes en total`);
        return true;
    } catch (err) {
        console.error('❌ Error en inserción bulk:', err);
        return false;
    }
};
