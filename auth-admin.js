
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

export async function verificarSenha(senha, senhaHash) {
    return bcrypt.compare(senha, senhaHash);
}

export function gerarToken(admin) {
    const segredo = process.env.JWT_SECRET;

    if (!segredo) {
        throw new Error(
            "JWT_SECRET não foi carregado. Confira o arquivo .env."
        );
    }

    return jwt.sign(
        {
            id: admin.id,
            email: admin.email,
            tipo: "admin"
        },
        segredo,
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
        const segredo = process.env.JWT_SECRET;

        if (!segredo) {
            throw new Error("JWT_SECRET não foi carregado.");
        }

        const dados = jwt.verify(token, segredo);

        if (dados.tipo !== "admin") {
            return res.status(403).json({
                erro: "Acesso permitido somente ao administrador."
            });
        }

        req.admin = dados;
        return next();

    } catch (error) {
        return res.status(401).json({
            erro: "Token inválido ou expirado. Faça login novamente."
        });
    }
}
