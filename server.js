
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pool from "./database.js";
import {
  verificarSenha,
  gerarToken,
  autenticarAdmin
} from "./auth-admin.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
// CADASTRAR CLIENTE
// ========================================
app.post("/api/clientes", async (req, res) => {
  console.log("🚀 ROTA DE CADASTRO DE CLIENTE FOI CHAMADA!");

  try {
    const { nome, telefone, email, senha } = req.body;

    if (
      typeof nome !== "string" ||
      typeof telefone !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !nome.trim() ||
      !telefone.trim() ||
      !email.trim() ||
      senha.length < 6
    ) {
      return res.status(400).json({
        erro: "Preencha nome, telefone, e-mail e uma senha com pelo menos 6 caracteres."
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const [existentes] = await pool.execute(
      "SELECT id FROM clientes WHERE email = ? LIMIT 1",
      [emailNormalizado]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        erro: "Já existe um cadastro com esse e-mail. Tente entrar na sua conta."
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await pool.execute(
      `INSERT INTO clientes (nome, telefone, email, senha_hash)
       VALUES (?, ?, ?, ?)`,
      [
        nome.trim(),
        telefone.trim(),
        emailNormalizado,
        senhaHash
      ]
    );

    return res.status(201).json({
      mensagem: "Cadastro realizado com sucesso!",
      cliente: {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: emailNormalizado
      }
    });
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error.message);

    return res.status(500).json({
      erro: "Não foi possível realizar o cadastro."
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
        erro: "Sua conta ainda não possui uma senha cadastrada. Crie uma nova conta com outro e-mail ou regularize seu cadastro."
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      cliente.senha_hash
    );
    console.log("E-mail encontrado:", cliente.email);
console.log("Hash existe:", Boolean(cliente.senha_hash));
console.log("Senha correta?", senhaCorreta);

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
// LISTAR CLIENTES
// ========================================
app.get("/api/clientes", async (req, res) => {
  try {
    const [clientes] = await pool.query(`
      SELECT id, nome, telefone, email, criado_em
      FROM clientes
      ORDER BY id DESC
    `);

    return res.json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error.message);

    return res.status(500).json({
      erro: "Erro ao buscar clientes."
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
// CRIAR AGENDAMENTO
// ========================================
app.post("/api/agendamentos", async (req, res) => {
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

    // Aceita data no formato DD/MM/AAAA ou AAAA-MM-DD.
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

    // Localiza o cliente cadastrado.
    const [clientes] = await pool.execute(
      `SELECT id
       FROM clientes
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        erro: "Cliente não encontrado. Faça seu cadastro antes de agendar."
      });
    }

    // Localiza o serviço selecionado.
    console.log("Serviço recebido do site:", servico);
    const [servicos] = await pool.execute(
      `SELECT id
       FROM servicos
       WHERE nome = ? AND ativo = 1
       LIMIT 1`,
      [servico.trim()]
    );

    if (servicos.length === 0) {
      return res.status(404).json({
        erro: "Serviço não encontrado ou indisponível."
      });
    }

    // Localiza o barbeiro selecionado.
    const [barbeiros] = await pool.execute(
      `SELECT id
       FROM barbeiros
       WHERE nome = ?
       LIMIT 1`,
      [barbeiro.trim()]
    );

    if (barbeiros.length === 0) {
      return res.status(404).json({
        erro: "Barbeiro não encontrado."
      });
    }

    // Impede dois agendamentos ativos no mesmo horário
    // para o mesmo barbeiro.
    const [conflitos] = await pool.execute(
      `SELECT id
       FROM agendamentos
       WHERE barbeiro_id = ?
         AND data_agendamento = ?
         AND hora_agendamento = ?
         AND status <> 'cancelado'
       LIMIT 1`,
      [
        barbeiros[0].id,
        dataBanco,
        horario.trim()
      ]
    );

    if (conflitos.length > 0) {
      return res.status(409).json({
        erro: "Esse barbeiro já possui um agendamento nesse horário. Escolha outro horário."
      });
    }

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
        clientes[0].id,
        servicos[0].id,
        barbeiros[0].id,
        dataBanco,
        horario.trim()
      ]
    );

    return res.status(201).json({
      mensagem: "Agendamento confirmado com sucesso!",
      id: resultado.insertId
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error.message);

    return res.status(500).json({
      erro: "Não foi possível salvar o agendamento."
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
    console.error("Erro no MySQL:", error.message);

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
