
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function verificarSenha(senha, senhaHash) {
  return bcrypt.compare(senha, senhaHash);
}

export function gerarToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      tipo: "admin"
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export function autenticarAdmin(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({
      erro: "Acesso não autorizado. Faça login."
    });
  }

  const token = cabecalho.split(" ")[1];

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    if (dados.tipo !== "admin") {
      return res.status(403).json({
        erro: "Acesso permitido somente ao administrador."
      });
    }

    req.admin = dados;
    next();
  } catch (error) {
    return res.status(401).json({
      erro: "Token inválido ou expirado. Faça login novamente."
    });
  }
}
