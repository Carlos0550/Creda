import pool from "../../connections/database_conn";

export const deleteAllClients = async (): Promise<boolean> => {
    let client;
    try {
        client = await pool.connect();
        await client.query("DELETE FROM clients");
        return true;
    } catch (error) {
        console.error("❌ Error conectando a PostgreSQL:", error);
        return false;
    } finally {
        if (client) client.release();
    }
};