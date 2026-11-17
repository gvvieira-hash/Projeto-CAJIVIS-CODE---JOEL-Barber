import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js"; 

export async function cadastrarCliente(req, res) {
  try {
    const { nome, telefone, email, senha } = req.body;

    if (!nome || !telefone || !senha) {
      return res.status(400).json({
        mensagem: "Nome, telefone e senha são obrigatórios."
      });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const cliente = await prisma.clientes.create({
      data: {
        nome,
        telefone,
        email: email || null,
        senha_hash
      }
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
    const clientes = await prisma.clientes.findMany();

    return res.status(200).json(clientes);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      mensagem: "Erro ao consultar clientes."
    });
  }
}
