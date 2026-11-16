
import bcrypt from "bcryptjs";
import {
  criarCliente,
  listarClientes
} from "../models/clienteModel.js";

export async function cadastrarCliente(req, res) {
  try {
    const { nome, telefone, email, senha } = req.body;

    if (!nome || !telefone || !senha) {
      return res.status(400).json({
        mensagem: "Nome, telefone e senha são obrigatórios."
      });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const cliente = await criarCliente({
      nome,
      telefone,
      email: email || null,
      senha_hash
    });

    return res.status(201).json({
      mensagem: "Cliente cadastrado com sucesso!",
      cliente
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao cadastrar cliente."
    });
  }
}

export async function consultarClientes(req, res) {
  try {
    const clientes = await listarClientes();

    return res.status(200).json(clientes);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: "Erro ao consultar clientes."
    });
  }
}
