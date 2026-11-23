
const jwt = require("jsonwebtoken");
const db = require("./db");

// Verifica se o usuário está autenticado
async function autenticar(req, res, next) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({
            erro: "Token não informado"
        });
    }

    try {
        const token = auth.split(" ")[1];

        const dados = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const resultado = await db.query(
            `SELECT id, nome, email, perfil
             FROM usuarios WHERE id = $1`,
            [dados.sub]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                erro: "Usuário não encontrado"
            });
        }

        req.usuario = resultado.rows[0];
        next();
    } catch (erro) {
        return res.status(401).json({
            erro: "Token inválido ou expirado"
        });
    }
}

// Verifica as permissões
function autorizar(...perfis) {
    return (req, res, next) => {
        if (!req.usuario ||
            !perfis.includes(req.usuario.perfil)) {
            return res.status(403).json({
                erro: "Acesso negado"
            });
        }

        next();
    };
}

module.exports = {
    autenticar,
    autorizar
};
