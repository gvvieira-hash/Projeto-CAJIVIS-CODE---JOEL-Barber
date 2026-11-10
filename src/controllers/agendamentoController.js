
import {
    buscarClientePorEmail,
    buscarServicoPorNome,
    buscarBarbeiroPorNome,
    verificarConflito,
    inserirAgendamento
} from "../models/agendamentoModel.js";

export async function criarAgendamento(req, res) {
    try {
        const {
            email,
            servico,
            barbeiro,
            data,
            horario
        } = req.body;

        if (
            typeof email !== "string" ||
            typeof servico !== "string" ||
            typeof barbeiro !== "string" ||
            typeof data !== "string" ||
            typeof horario !== "string" ||
            !email.trim() ||
            !servico.trim() ||
            !barbeiro.trim() ||
            !data.trim() ||
            !horario.trim()
        ) {
            return res.status(400).json({
                erro: "Estão faltando informações do agendamento."
            });
        }

        let dataBanco = data.trim();

        const dataBrasileira = dataBanco.match(
            /^(\d{2})\/(\d{2})\/(\d{4})$/
        );

        if (dataBrasileira) {
            dataBanco =
                `${dataBrasileira[3]}-${dataBrasileira[2]}-${dataBrasileira[1]}`;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(dataBanco)) {
            return res.status(400).json({
                erro: "A data do agendamento está em um formato inválido."
            });
        }

        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario.trim())) {
            return res.status(400).json({
                erro: "O horário do agendamento está inválido."
            });
        }

        const clientes = await buscarClientePorEmail(
            email.trim().toLowerCase()
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                erro: "Cliente não encontrado. Faça seu cadastro antes de agendar."
            });
        }

        const servicos = await buscarServicoPorNome(
            servico.trim()
        );

        if (servicos.length === 0) {
            return res.status(404).json({
                erro: "Serviço não encontrado ou indisponível."
            });
        }

        const barbeiros = await buscarBarbeiroPorNome(
            barbeiro.trim()
        );

        if (barbeiros.length === 0) {
            return res.status(404).json({
                erro: "Barbeiro não encontrado ou indisponível."
            });
        }

        const conflitos = await verificarConflito(
            barbeiros[0].id,
            dataBanco,
            horario.trim()
        );

        if (conflitos.length > 0) {
            return res.status(409).json({
                erro: "Esse barbeiro já possui um agendamento nesse horário. Escolha outro horário."
            });
        }

        const id = await inserirAgendamento(
            clientes[0].id,
            servicos[0].id,
            barbeiros[0].id,
            dataBanco,
            horario.trim()
        );

        return res.status(201).json({
            mensagem: "Agendamento confirmado com sucesso!",
            id
        });

    } catch (error) {
        console.error("Erro ao criar agendamento:", error.message);

        return res.status(500).json({
            erro: "Não foi possível salvar o agendamento."
        });
    }
}