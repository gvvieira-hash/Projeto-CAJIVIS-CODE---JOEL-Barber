import { listarServicos as buscarServicos } from "../models/servicoModel.js";

export async function listarServicos(req, res) {
    try {
        const servicos = await buscarServicos();
        return res.json(servicos);
    } catch (error) {
        console.error("Erro ao buscar serviços:", error.message);

        return res.status(500).json({
            erro: "Erro ao buscar serviços."
        });
    }
}