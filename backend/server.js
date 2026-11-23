
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const transacoes = require("./transacoes");
const { autenticar, autorizar } = require("./auth");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");
const { calcularResumo } = require("./financeiro");

require("dotenv").config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://cardpaysenai.netlify.app"
    ]
}));

app.use(express.json({ limit: "100kb" }));

// VERIFICAR API E BANCO

app.get("/api/health", async (req, res) => {
    try {
        const resultado = await db.query(
            "SELECT COUNT(*)::int AS total FROM usuarios"
        );

        res.json({
            status: "ok",
            mensagem: "MetaPay funcionando!",
            banco: "conectado",
            usuarios: resultado.rows[0].total
        });
    } catch (erro) {
        console.error(erro.message);

        res.status(503).json({
            erro: "Falha na conexão com o banco"
        });
    }
});

// CADASTRAR USUÁRIO

app.post("/api/auth/register", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (
            typeof nome !== "string" ||
            typeof email !== "string" ||
            typeof senha !== "string"
        ) {
            return res.status(400).json({
                erro: "Preencha todos os campos"
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (
            nomeLimpo.length < 2 ||
            nomeLimpo.length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo) ||
            emailLimpo.length > 150 ||
            senha.length < 8 ||
            Buffer.byteLength(senha, "utf8") > 72
        ) {
            return res.status(400).json({
                erro: "Informe nome, e-mail válido e senha de 8 a 72 bytes"
            });
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        const resultado = await db.query(
            `INSERT INTO usuarios
             (nome, email, senha_hash, perfil)
             VALUES ($1, $2, $3, 'usuario')
             RETURNING id, nome, email, perfil`,
            [nomeLimpo, emailLimpo, senhaHash]
        );

        const usuario = resultado.rows[0];

        const token = jwt.sign(
            { sub: String(usuario.id) },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(201).json({
            mensagem: "Conta criada com sucesso!",
            usuario,
            token
        });
    } catch (erro) {
        if (erro.code === "23505") {
            return res.status(409).json({
                erro: "Este e-mail já está cadastrado"
            });
        }

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao cadastrar usuário"
        });
    }
});

// LOGIN

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (
            typeof email !== "string" ||
            typeof senha !== "string"
        ) {
            return res.status(400).json({
                erro: "Informe e-mail e senha"
            });
        }

        const resultado = await db.query(
            `SELECT id, nome, email, perfil, senha_hash
             FROM usuarios
             WHERE email = $1`,
            [email.trim().toLowerCase()]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                erro: "E-mail ou senha incorretos"
            });
        }

        const usuario = resultado.rows[0];

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: "E-mail ou senha incorretos"
            });
        }

        const token = jwt.sign(
            { sub: String(usuario.id) },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            mensagem: "Login realizado!",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao realizar login"
        });
    }
});

// ROTA PROTEGIDA

app.get("/api/auth/me", autenticar, (req, res) => {
    res.json({
        usuario: req.usuario
    });
});

// ROTA EXCLUSIVA PARA ADMIN

app.get(
    "/api/admin/check",
    autenticar,
    autorizar("admin"),
    (req, res) => {
        res.json({
            mensagem: "Acesso de administrador autorizado"
        });
    }
);

app.use("/api/transacoes", transacoes);

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);


app.get("/api/dashboard/resumo", autenticar, async (req, res) => {
    try {
        const resultado = await db.query(
            `SELECT tipo, valor FROM transacoes
             WHERE usuario_id = $1`,
            [req.usuario.id]
        );

        const resumo = calcularResumo(resultado.rows);

        res.json(resumo);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao carregar resumo financeiro"
        });
    }
});


const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(
        `MetaPay API rodando na porta ${PORT}`
    );
});
