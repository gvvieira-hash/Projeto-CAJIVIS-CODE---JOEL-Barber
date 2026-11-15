
import axios from "axios";
import pool from "../../database.js";

let verificacaoEmAndamento = false;

function escaparHTML(valor = "") {
    return String(valor).replace(/[&<>"']/g, (caractere) => {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteres[caractere];
    });
}

function formatarData(data) {
    if (typeof data === "string") {
        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    return data;
}

async function enviarEmailLembrete(agendamento) {
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
        throw new Error("Configuração do Brevo não encontrada.");
    }

    const nome = escaparHTML(agendamento.cliente);
    const servico = escaparHTML(agendamento.servico);
    const barbeiro = escaparHTML(agendamento.barbeiro || "Não informado");
    const data = escaparHTML(formatarData(agendamento.data));
    const horario = escaparHTML(agendamento.horario);

    await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
            sender: {
                name: "Joel Barber",
                email: process.env.BREVO_SENDER_EMAIL
            },
            to: [{
                email: agendamento.email,
                name: agendamento.cliente
            }],
            subject: "Lembrete do seu agendamento - Joel Barber",
            htmlContent: `
                <div style="font-family: Arial, sans-serif; background-color: #111; color: #fff; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #d4a24c;">Olá, ${nome}!</h2>

                    <p>Passando para lembrar que seu horário na Joel Barber está se aproximando.</p>

                    <div style="background-color: #202020; padding: 20px; border-radius: 10px; line-height: 1.8;">
                        <p><strong>Serviço:</strong> ${servico}</p>
                        <p><strong>Barbeiro:</strong> ${barbeiro}</p>
                        <p><strong>Data:</strong> ${data}</p>
                        <p><strong>Horário:</strong> ${horario}</p>
                    </div>

                    <p style="margin-top: 25px;">Estamos esperando por você!</p>

                    <p style="color: #d4a24c;">Joel Barber - Seu estilo, nosso compromisso.</p>
                </div>
            `
        },
        {
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout: 15000
        }
    );
}

async function processarLembretes() {
    if (verificacaoEmAndamento) return;

    verificacaoEmAndamento = true;

    try {
        const [agendamentos] = await pool.execute(`
            SELECT
                a.id,
                c.nome AS cliente,
                c.email,
                s.nome AS servico,
                b.nome AS barbeiro,
                DATE_FORMAT(a.data_agendamento, '%Y-%m-%d') AS data,
                TIME_FORMAT(a.hora_agendamento, '%H:%i') AS horario
            FROM agendamentos a
            INNER JOIN clientes c ON c.id = a.cliente_id
            INNER JOIN servicos s ON s.id = a.servico_id
            LEFT JOIN barbeiros b ON b.id = a.barbeiro_id
            WHERE a.status IN ('agendado', 'confirmado')
                AND c.email IS NOT NULL
                AND c.email <> ''
                AND TIMESTAMP(a.data_agendamento, a.hora_agendamento) BETWEEN
                    DATE_ADD(
                        CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '-03:00'),
                        INTERVAL 355 MINUTE
                    )
                    AND
                    DATE_ADD(
                        CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '-03:00'),
                        INTERVAL 365 MINUTE
                    )
            ORDER BY a.data_agendamento, a.hora_agendamento
        `);

        for (const agendamento of agendamentos) {
            try {
                const [insercao] = await pool.execute(
                    `INSERT IGNORE INTO lembretes_agendamento
                    (agendamento_id, status, tentativas, bloqueado_em)
                    VALUES (?, 'processando', 1, UTC_TIMESTAMP())`,
                    [agendamento.id]
                );

                let reservado = insercao.affectedRows === 1;

                if (!reservado) {
                    const [atualizacao] = await pool.execute(
                        `UPDATE lembretes_agendamento
                        SET status = 'processando',
                            tentativas = tentativas + 1,
                            bloqueado_em = UTC_TIMESTAMP(),
                            ultimo_erro = NULL
                        WHERE agendamento_id = ?
                            AND tentativas < 3
                            AND (
                                (
                                    status = 'erro'
                                    AND atualizado_em <
                                        DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE)
                                )
                                OR
                                (
                                    status = 'processando'
                                    AND bloqueado_em <
                                        DATE_SUB(UTC_TIMESTAMP(), INTERVAL 10 MINUTE)
                                )
                            )`,
                        [agendamento.id]
                    );

                    reservado = atualizacao.affectedRows === 1;
                }

                if (!reservado) continue;

                const [ativos] = await pool.execute(
                    `SELECT id
                    FROM agendamentos
                    WHERE id = ?
                    AND status IN ('agendado', 'confirmado')
                    LIMIT 1`,
                    [agendamento.id]
                );

                if (ativos.length === 0) {
                    await pool.execute(
                        `DELETE FROM lembretes_agendamento
                        WHERE agendamento_id = ?
                        AND status = 'processando'`,
                        [agendamento.id]
                    );

                    continue;
                }

                await enviarEmailLembrete(agendamento);

                await pool.execute(
                    `UPDATE lembretes_agendamento
                    SET status = 'enviado',
                        enviado_em = UTC_TIMESTAMP(),
                        ultimo_erro = NULL
                    WHERE agendamento_id = ?`,
                    [agendamento.id]
                );

                console.log(
                    `Lembrete enviado para o agendamento ${agendamento.id}`
                );

            } catch (erro) {
                console.error(
                    `Erro no lembrete ${agendamento.id}:`,
                    erro.response?.data || erro.message
                );

                await pool.execute(
                    `UPDATE lembretes_agendamento
                    SET status = 'erro',
                        ultimo_erro = ?
                    WHERE agendamento_id = ?
                    AND status = 'processando'`,
                    [
                        String(erro.message).slice(0, 2000),
                        agendamento.id
                    ]
                );
            }
        }

    } catch (erro) {
        console.error("Erro ao verificar lembretes:", erro.message);

    } finally {
        verificacaoEmAndamento = false;
    }
}

export function iniciarLembretesAutomaticos() {
    console.log("Sistema de lembretes iniciado.");

    processarLembretes();

    setInterval(() => {
        processarLembretes();
    }, 60 * 1000);
}
