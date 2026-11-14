
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
import catalogoRoutes from "./src/routes/catalogoRoutes.js";
dotenv.config();
import agendamentoRoutes from "./src/routes/agendamentoRoutes.js";
import axios from "axios";
import { randomInt, createHash, timingSafeEqual } from "node:crypto";


const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
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
      SELECT id, nome, ativo
      FROM barbeiros
      ORDER BY nome ASC
    `);
    res.json(barbeiros);
  } catch (error) {
    console.error("Erro ao listar barbeiros no painel:", error.message);
    res.status(500).json({ erro: "Não foi possível carregar os barbeiros." });
  }
});

app.patch("/api/admin/barbeiros/:id/status", autenticarAdmin, async (req, res) => {
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
});




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

// ========================================
// CADASTRO COM CONFIRMAÇÃO POR E-MAIL
// ========================================
app.post("/api/clientes", async (req, res) => {
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
        erro: "Preencha todos os campos. A senha precisa ter pelo menos 6 caracteres."
      });
    }

    if (!process.env.BREVO_API_KEY ||
        !process.env.BREVO_SENDER_EMAIL ||
        !process.env.EMAIL_CODE_SECRET) {
      return res.status(500).json({
        erro: "Configuração de e-mail incompleta no servidor."
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

    const [pendentes] = await pool.execute(
      "SELECT criado_em FROM verificacoes_email WHERE email = ? LIMIT 1",
      [emailNormalizado]
    );

    if (
      pendentes.length > 0 &&
      Date.now() - new Date(pendentes[0].criado_em).getTime() < 60000
    ) {
      return res.status(429).json({
        erro: "Aguarde um minuto antes de solicitar outro código."
      });
    }

    const codigo = String(randomInt(100000, 1000000));

    const codigoHash = createHash("sha256")
      .update(`${emailNormalizado}:${codigo}:${process.env.EMAIL_CODE_SECRET}`)
      .digest("hex");

    const senhaHash = await bcrypt.hash(senha, 10);

    await pool.execute(
      `INSERT INTO verificacoes_email
       (email, nome, telefone, senha_hash, codigo_hash, expira_em, tentativas)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)
       ON DUPLICATE KEY UPDATE
       nome = VALUES(nome),
       telefone = VALUES(telefone),
       senha_hash = VALUES(senha_hash),
       codigo_hash = VALUES(codigo_hash),
       expira_em = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
       tentativas = 0,
       criado_em = CURRENT_TIMESTAMP`,
      [
        emailNormalizado,
        nome.trim(),
        telefone.trim(),
        senhaHash,
        codigoHash
      ]
    );

    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: "Joel Barber",
            email: process.env.BREVO_SENDER_EMAIL
          },
          to: [{ email: emailNormalizado }],
          subject: "Confirme seu cadastro - Joel Barber",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Bem-vindo ao Joel Barber!</h2>
              <p>Use o código abaixo para confirmar seu cadastro:</p>
              <h1 style="letter-spacing: 8px;">${codigo}</h1>
              <p>Este código expira em 10 minutos.</p>
              <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
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
    } catch (erroEmail) {
      await pool.execute(
        "DELETE FROM verificacoes_email WHERE email = ? AND codigo_hash = ?",
        [emailNormalizado, codigoHash]
      );

      console.error(
        "Erro no envio pelo Brevo:",
        erroEmail.response?.data || erroEmail.message
      );

      return res.status(502).json({
        erro: "Não foi possível enviar o e-mail de confirmação."
      });
    }

    return res.status(200).json({
      mensagem: "Código de confirmação enviado para seu e-mail."
    });

  } catch (error) {
    console.error("Erro ao solicitar confirmação:", error.message);

    return res.status(500).json({
      erro: "Não foi possível iniciar o cadastro."
    });
  }
});

// ========================================
// CONFIRMAR CADASTRO POR E-MAIL
// ========================================
app.post("/api/clientes/confirmar", async (req, res) => {
  let conexao;

  try {
    const { email, codigo } = req.body;

    if (
      typeof email !== "string" ||
      typeof codigo !== "string" ||
      !/^\d{6}$/.test(codigo)
    ) {
      return res.status(400).json({
        erro: "Informe um e-mail e um código válido de 6 dígitos."
      });
    }

    if (!process.env.EMAIL_CODE_SECRET) {
      return res.status(500).json({
        erro: "Configuração de segurança incompleta."
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    conexao = await pool.getConnection();
    await conexao.beginTransaction();

    const [pendentes] = await conexao.execute(
      `SELECT * FROM verificacoes_email
       WHERE email = ?
       LIMIT 1
       FOR UPDATE`,
      [emailNormalizado]
    );

    if (pendentes.length === 0) {
      await conexao.rollback();

      return res.status(400).json({
        erro: "Não existe uma confirmação pendente para esse e-mail."
      });
    }

    const pendente = pendentes[0];

    if (new Date(pendente.expira_em).getTime() <= Date.now()) {
      await conexao.execute(
        "DELETE FROM verificacoes_email WHERE id = ?",
        [pendente.id]
      );

      await conexao.commit();

      return res.status(400).json({
        erro: "O código expirou. Solicite um novo cadastro."
      });
    }

    if (pendente.tentativas >= 5) {
      await conexao.execute(
        "DELETE FROM verificacoes_email WHERE id = ?",
        [pendente.id]
      );

      await conexao.commit();

      return res.status(429).json({
        erro: "Limite de tentativas atingido. Solicite um novo código."
      });
    }

    const codigoHashRecebido = createHash("sha256")
      .update(`${emailNormalizado}:${codigo}:${process.env.EMAIL_CODE_SECRET}`)
      .digest("hex");

    const hashSalvo = Buffer.from(pendente.codigo_hash, "hex");
    const hashRecebido = Buffer.from(codigoHashRecebido, "hex");

    const codigoCorreto =
      hashSalvo.length === hashRecebido.length &&
      timingSafeEqual(hashSalvo, hashRecebido);

    if (!codigoCorreto) {
      await conexao.execute(
        "UPDATE verificacoes_email SET tentativas = tentativas + 1 WHERE id = ?",
        [pendente.id]
      );

      await conexao.commit();

      return res.status(400).json({
        erro: "Código incorreto. Confira seu e-mail e tente novamente."
      });
    }

    const [existentes] = await conexao.execute(
      "SELECT id FROM clientes WHERE email = ? LIMIT 1",
      [emailNormalizado]
    );

    if (existentes.length > 0) {
      await conexao.execute(
        "DELETE FROM verificacoes_email WHERE id = ?",
        [pendente.id]
      );

      await conexao.commit();

      return res.status(409).json({
        erro: "Já existe um cadastro com esse e-mail."
      });
    }

    await conexao.execute(
      `INSERT INTO clientes (nome, telefone, email, senha_hash)
       VALUES (?, ?, ?, ?)`,
      [
        pendente.nome,
        pendente.telefone,
        pendente.email,
        pendente.senha_hash
      ]
    );

    await conexao.execute(
      "DELETE FROM verificacoes_email WHERE id = ?",
      [pendente.id]
    );

    await conexao.commit();

    return res.status(201).json({
      mensagem: "E-mail confirmado e cadastro realizado com sucesso!",
      cliente: {
        nome: pendente.nome,
        telefone: pendente.telefone,
        email: pendente.email
      }
    });

  } catch (error) {
    if (conexao) {
      await conexao.rollback();
    }

    console.error("Erro ao confirmar cadastro:", error.message);

    return res.status(500).json({
      erro: "Não foi possível confirmar o cadastro."
    });

  } finally {
    if (conexao) {
      conexao.release();
    }
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

// Lista somente os barbeiros disponíveis para agendamento
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
