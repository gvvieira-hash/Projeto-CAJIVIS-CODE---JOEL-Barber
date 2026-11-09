
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

dotenv.config();

const rl = readline.createInterface({ input, output });

let connection;

try {
  const email = "joeladmin@gmail.com";

  const senha = await rl.question(
    "Digite uma senha forte para o administrador: "
  );

  if (senha.length < 12) {
    throw new Error("A senha deve ter pelo menos 12 caracteres.");
  }

  const confirmacao = await rl.question("Confirme a senha: ");

  if (senha !== confirmacao) {
    throw new Error("As senhas não coincidem.");
  }

  const hash = await bcrypt.hash(senha, 12);

  connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "joel_barber"
  });

  await connection.execute(
    `INSERT INTO administradores (email, senha_hash)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE senha_hash = VALUES(senha_hash)`,
    [email, hash]
  );

  console.log("Conta administrativa configurada com sucesso!");
  console.log("E-mail:", email);
} catch (error) {
  console.error("Erro:", error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
  rl.close();
}
