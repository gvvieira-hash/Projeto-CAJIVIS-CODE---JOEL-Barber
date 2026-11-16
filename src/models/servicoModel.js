
import pool from "../../database.js";

export async function listarServicos() {
    const [servicos] = await pool.query(`
        SELECT
            id,
            nome,
            preco,
            duracao_minutos,
            ativo,
            icone
        FROM servicos
        WHERE ativo = 1
        ORDER BY nome
    `);

    return servicos;
}
