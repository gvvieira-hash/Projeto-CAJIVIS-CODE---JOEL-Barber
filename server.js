
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

app.patch("/api/admin/agendamentos/:id/concluir", autenticarAdmin, async (req, res) => {
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
});

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
// ÁREA ADMINISTRATIVA: CLIENTES E BARBEIROS
// ========================================
app.get("/api/admin/clientes", autenticarAdmin, async (req, res) => {
  try {
    const [clientes] = await pool.query(`
      SELECT id, nome, telefone, email, criado_em
      FROM clientes
      ORDER BY nome ASC
    `);
    res.json(clientes);
  } catch (error) {
    console.error("Erro ao listar clientes no painel:", error.message);
    res.status(500).json({ erro: "Não foi possível carregar os clientes." });
  }
});

app.get("/api/admin/barbeiros", autenticarAdmin, async (req, res) => {
  try {
    const [barbeiros] = await pool.query(`
      SELECT id, nome
      FROM barbeiros
      ORDER BY nome ASC
    `);
    res.json(barbeiros);
  } catch (error) {
    console.error("Erro ao listar barbeiros no painel:", error.message);
    res.status(500).json({ erro: "Não foi possível carregar os barbeiros." });
  }
});


app.post("/api/admin/barbeiros", autenticarAdmin, async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "Informe o nome do barbeiro."
      });
    }

    const [resultado] = await pool.query(
      "INSERT INTO barbeiros (nome, ativo) VALUES (?, 1)",
      [nome.trim()]
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
// Execute antes: sql/05_produtos.sql
// ========================================
app.get("/api/produtos", async (req, res) => {
  try {
    const [produtos] = await pool.query(`
      SELECT id, nome, descricao, preco, categoria, imagem_url
      FROM produtos
      WHERE ativo = 1
      ORDER BY nome ASC
    `);
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos da loja:", error.message);
    res.status(500).json({ erro: "Não foi possível carregar os produtos." });
  }
});

app.get("/api/admin/produtos", autenticarAdmin, async (req, res) => {
  try {
    const [produtos] = await pool.query(`
      SELECT id, nome, descricao, preco, categoria, imagem_url, ativo
      FROM produtos
      ORDER BY id DESC
    `);
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos administrativos:", error.message);
    res.status(500).json({ erro: "Não foi possível carregar os produtos." });
  }
});

app.post("/api/admin/produtos", autenticarAdmin, async (req, res) => {
  try {
    const { nome, descricao = "", preco, categoria, imagem_url = "", ativo = 1 } = req.body;
    const precoNumero = Number(preco);
    const categorias = ["cabelo", "barba", "acabamento", "acessorios"];
    if (typeof nome !== "string" || !nome.trim() || !Number.isFinite(precoNumero) || precoNumero <= 0 || !categorias.includes(categoria)) {
      return res.status(400).json({ erro: "Informe nome, preço válido e uma categoria." });
    }
    const [resultado] = await pool.execute(`
      INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, ativo)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nome.trim(), String(descricao).trim(), precoNumero, categoria, String(imagem_url).trim(), ativo ? 1 : 0]);
    res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", id: resultado.insertId });
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error.message);
    res.status(500).json({ erro: "Não foi possível cadastrar o produto. Confira se executou sql/05_produtos.sql." });
  }
});

app.put("/api/admin/produtos/:id", autenticarAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, descricao = "", preco, categoria, imagem_url = "", ativo = 1 } = req.body;
    const precoNumero = Number(preco);
    const categorias = ["cabelo", "barba", "acabamento", "acessorios"];
    if (!Number.isInteger(id) || id <= 0 || typeof nome !== "string" || !nome.trim() || !Number.isFinite(precoNumero) || precoNumero <= 0 || !categorias.includes(categoria)) {
      return res.status(400).json({ erro: "Dados do produto inválidos." });
    }
    const [resultado] = await pool.execute(`
      UPDATE produtos
      SET nome = ?, descricao = ?, preco = ?, categoria = ?, imagem_url = ?, ativo = ?
      WHERE id = ?
    `, [nome.trim(), String(descricao).trim(), precoNumero, categoria, String(imagem_url).trim(), ativo ? 1 : 0, id]);
    if (!resultado.affectedRows) return res.status(404).json({ erro: "Produto não encontrado." });
    res.json({ mensagem: "Produto atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error.message);
    res.status(500).json({ erro: "Não foi possível atualizar o produto." });
  }
});

app.delete("/api/admin/produtos/:id", autenticarAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID de produto inválido." });
    const [resultado] = await pool.execute("DELETE FROM produtos WHERE id = ?", [id]);
    if (!resultado.affectedRows) return res.status(404).json({ erro: "Produto não encontrado." });
    res.json({ mensagem: "Produto excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error.message);
    res.status(500).json({ erro: "Não foi possível excluir o produto." });
  }
});

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

app.patch("/api/clientes/meus-agendamentos/:id/cancelar", async (req, res) => {
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
});

// ========================================
// TESTAR CONEXÃO COM MYSQL
// ========================================
console.log("HOST:", process.env.DB_HOST);
console.log("PORT:", process.env.DB_PORT);
console.log("USER:", process.env.DB_USER);
console.log("DATABASE:", process.env.DB_NAME);
console.log("PASSWORD CONFIGURADA:", !!process.env.DB_PASSWORD);
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
