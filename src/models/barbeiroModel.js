import pool from "../../database.js";

export async function listarBarbeiros() {
    const [barbeiros] = await pool.query(`
        SELECT id, nome, foto
        FROM barbeiros
        WHERE ativo = 1
        ORDER BY nome ASC
    `);

    return barbeiros;
}