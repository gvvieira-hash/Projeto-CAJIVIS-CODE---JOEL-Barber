import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pool from "./database.js";

import clienteRoutes from "./src/routes/clienteRoutes.js";
import catalogoRoutes from "./src/routes/catalogoRoutes.js";
import agendamentoRoutes from "./src/routes/agendamentoRoutes.js";

import {
  verificarSenha,
  gerarToken,
  autenticarAdmin
} from "./auth-admin.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ROTAS MVC + PRISMA
app.use("/api/clientes", clienteRoutes);

// OUTRAS ROTAS
app.use("/api", catalogoRoutes);
app.use("/api", agendamentoRoutes);

// ========================================
// LOGIN DO ADMINISTRADOR
// ========================================
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        erro: "Informe o e-mail e a senha."
      });
    }

    const [administradores] = await pool.execute(
      `SELECT id, email, senha_hash
       FROM administradores
       WHERE email = ?
       LIMIT 1`,
      [email.trim()]
    );

    if (administradores.length === 0) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    const admin = administradores[0];

    const senhaCorreta = await verificarSenha(
      senha,
      admin.senha_hash
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    const token = gerarToken(admin);

    return res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      administrador: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (error) {
    console.error("Erro no login administrativo:", error.message);

    return res.status(500).json({
      erro: "Erro interno ao realizar login."
    });
  }
});

// ========================================
// VERIFICAR ADMINISTRADOR
// ========================================
app.get(
  "/api/admin/verificar",
  autenticarAdmin,
  (req, res) => {
    res.json({
      mensagem: "Acesso administrativo autorizado!",
      administrador: req.admin.email
    });
  }
);

// ========================================
// LISTAR AGENDAMENTOS PARA O ADMIN
// ========================================
app.get(
  "/api/admin/agendamentos",
  autenticarAdmin,
  async (req, res) => {
    try {
      const [agendamentos] = await pool.query(`
        SELECT
          a.id,
          c.nome AS cliente,
          c.telefone,
          c.email,
          s.nome AS servico,
          s.preco,
          s.duracao_minutos,
          b.nome AS barbeiro,
          a.data_agendamento,
          a.hora_agendamento,
          a.status,
          a.observacoes
        FROM agendamentos a
        INNER JOIN clientes c ON c.id = a.cliente_id
        INNER JOIN servicos s ON s.id = a.servico_id
        LEFT JOIN barbeiros b ON b.id = a.barbeiro_id
        ORDER BY a.data_agendamento, a.hora_agendamento
      `);

      return res.json(agendamentos);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error.message);

      return res.status(500).json({
        erro: "Não foi possível buscar os agendamentos."
      });
    }
  }
);

// ========================================
// CONCLUIR AGENDAMENTO
// ========================================
app.patch(
  "/api/admin/agendamentos/:id/concluir",
  autenticarAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          erro: "ID de agendamento inválido."
        });
      }

      const [resultado] = await pool.execute(
        `UPDATE agendamentos
         SET status = 'concluido'
         WHERE id = ?
         AND status IN ('agendado', 'confirmado')`,
        [id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(400).json({
          erro: "Agendamento não encontrado ou não pode ser concluído."
        });
      }

      return res.json({
        mensagem: "Agendamento concluído com sucesso!"
      });
    } catch (erro) {
      console.error("Erro ao concluir agendamento:", erro);

      return res.status(500).json({
        erro: "Erro interno ao concluir agendamento."
      });
    }
  }
);

// ========================================
// CANCELAR AGENDAMENTO - ADMIN
// ========================================
app.patch(
  "/api/admin/agendamentos/:id/cancelar",
  autenticarAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          erro: "ID de agendamento inválido."
        });
      }

      const [resultado] = await pool.execute(
        `UPDATE agendamentos
         SET status = 'cancelado'
         WHERE id = ?
         AND status IN ('agendado', 'confirmado')`,
        [id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(400).json({
          erro: "Agendamento não encontrado ou não pode ser cancelado."
        });
      }

      return res.json({
        mensagem: "Agendamento cancelado com sucesso!"
      });
    } catch (erro) {
      console.error("Erro ao cancelar agendamento:", erro);

      return res.status(500).json({
        erro: "Erro interno ao cancelar agendamento."
      });
    }
  }
);

// ========================================
// ÁREA ADMINISTRATIVA: CLIENTES
// ========================================
app.get("/api/admin/clientes", autenticarAdmin, async (req, res) => {
  try {
    const [clientes] = await pool.query(`
      SELECT id, nome, telefone, email, criado_em
      FROM clientes
      ORDER BY nome ASC
    `);

    return res.json(clientes);
  } catch (error) {
    console.error("Erro ao listar clientes no painel:", error.message);

    return res.status(500).json({
      erro: "Não foi possível carregar os clientes."
    });
  }
});

// ========================================
// ÁREA ADMINISTRATIVA: BARBEIROS
// ========================================
app.get("/api/admin/barbeiros", autenticarAdmin, async (req, res) => {
  try {
    const [barbeiros] = await pool.query(`
      SELECT id, nome, ativo
      FROM barbeiros
      ORDER BY nome ASC
    `);

    return res.json(barbeiros);
  } catch (error) {
    console.error("Erro ao listar barbeiros no painel:", error.message);

    return res.status(500).json({
      erro: "Não foi possível carregar os barbeiros."
    });
  }
});

app.patch(
  "/api/admin/barbeiros/:id/status",
  autenticarAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          erro: "ID do barbeiro inválido."
        });
      }

      const [resultado] = await pool.query(
        `UPDATE barbeiros
         SET ativo = IF(ativo = 1, 0, 1)
         WHERE id = ?`,
        [id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          erro: "Barbeiro não encontrado."
        });
      }

      return res.json({
        mensagem: "Disponibilidade do barbeiro atualizada!"
      });
    } catch (error) {
      console.error("Erro ao alterar disponibilidade:", error.message);

      return res.status(500).json({
        erro: "Não foi possível alterar a disponibilidade."
      });
    }
  }
);

app.post("/api/admin/barbeiros", autenticarAdmin, async (req, res) => {
  try {
    const { nome, foto } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "Informe o nome do barbeiro."
      });
    }

    if (!foto || !foto.startsWith("data:image/")) {
      return res.status(400).json({
        erro: "Selecione uma foto válida para o barbeiro."
      });
    }

    const [resultado] = await pool.query(
      "INSERT INTO barbeiros (nome, foto, ativo) VALUES (?, ?, 1)",
      [nome.trim(), foto]
    );

    return res.status(201).json({
      mensagem: "Barbeiro cadastrado com sucesso!",
      id: resultado.insertId
    });
  } catch (error) {
    console.error("Erro ao cadastrar barbeiro:", error.message);

    return res.status(500).json({
      erro: "Não foi possível cadastrar o barbeiro."
    });
  }
});

// ========================================
// PRODUTOS: LISTAGEM PÚBLICA E GESTÃO ADMIN
// ========================================
app.get("/api/produtos", async (req, res) => {
  try {
    const [produtos] = await pool.query(`
      SELECT id, nome, descricao, preco, categoria, imagem_url
      FROM produtos
      WHERE ativo = 1
      ORDER BY nome ASC
    `);

    return res.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos da loja:", error.message);

    return res.status(500).json({
      erro: "Não foi possível carregar os produtos."
    });
  }
});

app.get("/api/admin/produtos", autenticarAdmin, async (req, res) => {
  try {
    const [produtos] = await pool.query(`
      SELECT id, nome, descricao, preco, categoria, imagem_url, ativo
      FROM produtos
      ORDER BY id DESC
    `);

    return res.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos administrativos:", error.message);

    return res.status(500).json({
      erro: "Não foi possível carregar os produtos."
    });
  }
});

app.post("/api/admin/produtos", autenticarAdmin, async (req, res) => {
  try {
    const {
      nome,
      descricao = "",
      preco,
      categoria,
      imagem_url = "",
      ativo = 1
    } = req.body;

    const precoNumero = Number(preco);
    const categorias = ["cabelo", "barba", "acabamento", "acessorios"];

    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      !Number.isFinite(precoNumero) ||
      precoNumero <= 0 ||
      !categorias.includes(categoria)
    ) {
      return res.status(400).json({
        erro: "Informe nome, preço válido e uma categoria."
      });
    }

    const [resultado] = await pool.execute(
      `INSERT INTO produtos
       (nome, descricao, preco, categoria, imagem_url, ativo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nome.trim(),
        String(descricao).trim(),
        precoNumero,
        categoria,
        String(imagem_url).trim(),
        ativo ? 1 : 0
      ]
    );

    return res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      id: resultado.insertId
    });
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error.message);

    return res.status(500).json({
      erro: "Não foi possível cadastrar o produto. Confira se executou sql/05_produtos.sql."
    });
  }
});

app.put("/api/admin/produtos/:id", autenticarAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      nome,
      descricao = "",
      preco,
      categoria,
      imagem_url = "",
      ativo = 1
    } = req.body;

    const precoNumero = Number(preco);
    const categorias = ["cabelo", "barba", "acabamento", "acessorios"];

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      typeof nome !== "string" ||
      !nome.trim() ||
      !Number.isFinite(precoNumero) ||
      precoNumero <= 0 ||
      !categorias.includes(categoria)
    ) {
      return res.status(400).json({
        erro: "Dados do produto inválidos."
      });
    }

    const [resultado] = await pool.execute(
      `UPDATE produtos
       SET nome = ?, descricao = ?, preco = ?, categoria = ?,
           imagem_url = ?, ativo = ?
       WHERE id = ?`,
      [
        nome.trim(),
        String(descricao).trim(),
        precoNumero,
        categoria,
        String(imagem_url).trim(),
        ativo ? 1 : 0,
        id
      ]
    );

    if (!resultado.affectedRows) {
      return res.status(404).json({
        erro: "Produto não encontrado."
      });
    }

    return res.json({
      mensagem: "Produto atualizado com sucesso!"
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error.message);

    return res.status(500).json({
      erro: "Não foi possível atualizar o produto."
    });
  }
});

app.delete("/api/admin/produtos/:id", autenticarAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID de produto inválido."
      });
    }

    const [resultado] = await pool.execute(
      "DELETE FROM produtos WHERE id = ?",
      [id]
    );

    if (!resultado.affectedRows) {
      return res.status(404).json({
        erro: "Produto não encontrado."
      });
    }

    return res.json({
      mensagem: "Produto excluído com sucesso!"
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error.message);

    return res.status(500).json({
      erro: "Não foi possível excluir o produto."
    });
  }
});

// ========================================
// LOGIN DO CLIENTE
// ========================================
app.post("/api/clientes/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        erro: "Informe seu e-mail e sua senha."
      });
    }

    const [clientes] = await pool.execute(
      `SELECT id, nome, telefone, email, senha_hash
       FROM clientes
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (clientes.length === 0) {
      return res.status(401).json({
        erro: "Você ainda não tem cadastro. Crie uma conta para entrar."
      });
    }

    const cliente = clientes[0];

    if (!cliente.senha_hash) {
      return res.status(401).json({
        erro: "Sua conta ainda não possui uma senha cadastrada. Regularize seu cadastro."
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      cliente.senha_hash
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    return res.json({
      mensagem: "Login realizado com sucesso!",
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email
      }
    });
  } catch (error) {
    console.error("Erro no login do cliente:", error.message);

    return res.status(500).json({
      erro: "Não foi possível realizar o login."
    });
  }
});

// ========================================
// LISTAR SERVIÇOS ATIVOS
// ========================================
app.get("/api/servicos", async (req, res) => {
  try {
    const [servicos] = await pool.query(`
      SELECT id, nome, preco, duracao_minutos, ativo
      FROM servicos
      WHERE ativo = 1
      ORDER BY nome
    `);

    return res.json(servicos);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error.message);

    return res.status(500).json({
      erro: "Erro ao buscar serviços."
    });
  }
});

// ========================================
// LISTAR BARBEIROS DISPONÍVEIS
// ========================================
app.get("/api/barbeiros", async (req, res) => {
  try {
    const [barbeiros] = await pool.query(`
      SELECT id, nome, foto
      FROM barbeiros
      WHERE ativo = 1
      ORDER BY nome ASC
    `);

    return res.json(barbeiros);
  } catch (error) {
    console.error("Erro ao listar barbeiros:", error.message);

    return res.status(500).json({
      erro: "Não foi possível carregar os barbeiros."
    });
  }
});

// ========================================
// LISTAR AGENDAMENTOS
// ========================================
app.get("/api/agendamentos", async (req, res) => {
  try {
    const [agendamentos] = await pool.query(`
      SELECT
        a.id,
        c.nome AS cliente,
        c.telefone,
        s.nome AS servico,
        s.preco,
        s.duracao_minutos,
        b.nome AS barbeiro,
        a.data_agendamento,
        a.hora_agendamento,
        a.status,
        a.observacoes
      FROM agendamentos a
      INNER JOIN clientes c ON c.id = a.cliente_id
      INNER JOIN servicos s ON s.id = a.servico_id
      LEFT JOIN barbeiros b ON b.id = a.barbeiro_id
      ORDER BY a.data_agendamento, a.hora_agendamento
    `);

    return res.json(agendamentos);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error.message);

    return res.status(500).json({
      erro: "Erro ao buscar agendamentos."
    });
  }
});

// ========================================
// LISTAR AGENDAMENTOS DE UM CLIENTE
// ========================================
app.get("/api/clientes/meus-agendamentos", async (req, res) => {
  try {
    const email = req.query.email;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        erro: "E-mail do cliente não informado."
      });
    }

    const [agendamentos] = await pool.execute(
      `SELECT
        a.id,
        s.nome AS servico,
        s.preco AS valor,
        s.duracao_minutos,
        b.nome AS barbeiro,
        DATE_FORMAT(a.data_agendamento, '%Y-%m-%d') AS data,
        TIME_FORMAT(a.hora_agendamento, '%H:%i') AS horario,
        a.status
      FROM agendamentos a
      INNER JOIN clientes c ON c.id = a.cliente_id
      INNER JOIN servicos s ON s.id = a.servico_id
      LEFT JOIN barbeiros b ON b.id = a.barbeiro_id
      WHERE c.email = ?
      ORDER BY a.data_agendamento DESC, a.hora_agendamento DESC`,
      [email.trim().toLowerCase()]
    );

    return res.json(agendamentos);
  } catch (error) {
    console.error("Erro ao buscar agendamentos do cliente:", error);

    return res.status(500).json({
      erro: "Não foi possível carregar seus agendamentos."
    });
  }
});

// ========================================
// CANCELAR AGENDAMENTO DO CLIENTE
// ========================================
app.patch(
  "/api/clientes/meus-agendamentos/:id/cancelar",
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const email = req.body?.email;

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          erro: "ID do agendamento inválido."
        });
      }

      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          erro: "E-mail do cliente não informado."
        });
      }

      const [resultado] = await pool.execute(
        `UPDATE agendamentos a
         INNER JOIN clientes c ON c.id = a.cliente_id
         SET a.status = 'cancelado'
         WHERE a.id = ?
           AND LOWER(c.email) = LOWER(?)
           AND a.status IN ('agendado', 'confirmado')
           AND TIMESTAMP(a.data_agendamento, a.hora_agendamento) > NOW()`,
        [id, email.trim()]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          erro: "Agendamento não encontrado, já cancelado, concluído ou não pode mais ser cancelado."
        });
      }

      return res.json({
        mensagem: "Agendamento cancelado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);

      return res.status(500).json({
        erro: "Não foi possível cancelar o agendamento."
      });
    }
  }
);

// ========================================
// TESTAR CONEXÃO COM MYSQL
// ========================================
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DATABASE() AS banco"
    );

    return res.json({
      mensagem: "Servidor conectado ao MySQL!",
      banco: rows[0].banco
    });
  } catch (error) {
    console.error("Erro no MySQL:", error);

    return res.status(500).json({
      erro: "Não foi possível conectar ao banco."
    });
  }
});

// ========================================
// INICIAR SERVIDOR
// ========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Joel Barber rodando em http://localhost:${PORT}`);
});
