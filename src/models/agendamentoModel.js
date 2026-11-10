
import pool from "../../database.js";

export async function buscarClientePorEmail(email) {
    const [clientes] = await pool.execute(
        `SELECT id
         FROM clientes
         WHERE email = ?
         LIMIT 1`,
        [email]
    );

    return clientes;
}

export async function buscarServicoPorNome(servico) {
    const [servicos] = await pool.execute(
        `SELECT id
         FROM servicos
         WHERE nome = ? AND ativo = 1
         LIMIT 1`,
        [servico]
    );

    return servicos;
}

export async function buscarBarbeiroPorNome(barbeiro) {
    const [barbeiros] = await pool.execute(
        `SELECT id
         FROM barbeiros
         WHERE nome = ? AND ativo = 1
         LIMIT 1`,
        [barbeiro]
    );

    return barbeiros;
}

export async function verificarConflito(
    barbeiroId,
    data,
    horario
) {
    const [conflitos] = await pool.execute(
        `SELECT id
         FROM agendamentos
         WHERE barbeiro_id = ?
           AND data_agendamento = ?
           AND hora_agendamento = ?
           AND status <> 'cancelado'
         LIMIT 1`,
        [barbeiroId, data, horario]
    );

    return conflitos;
}

export async function inserirAgendamento(
    clienteId,
    servicoId,
    barbeiroId,
    data,
    horario
) {
    const [resultado] = await pool.execute(
        `INSERT INTO agendamentos
         (
            cliente_id,
            servico_id,
            barbeiro_id,
            data_agendamento,
            hora_agendamento,
            status
         )
         VALUES (?, ?, ?, ?, ?, 'agendado')`,
        [
            clienteId,
            servicoId,
            barbeiroId,
            data,
            horario
        ]
    );

    return resultado.insertId;
}
