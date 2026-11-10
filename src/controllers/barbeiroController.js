import { listarBarbeiros as buscarBarbeiros } from "../models/barbeiroModel.js";

export async function listarBarbeiros(req, res) {
    try {
        const barbeiros = await buscarBarbeiros();
        return res.json(barbeiros);
    } catch (error) {
        console.error("Erro ao listar barbeiros:", error.message);

        return res.status(500).json({
            erro: "Não foi possível carregar os barbeiros."
        });
    }
}