
const express = require("express");
const db = require("./db");
const { autenticar } = require("./auth");

const router = express.Router();

router.use(autenticar);

// LISTAR TRANSAÇÕES DO USUÁRIO
router.get("/", async (req, res) => {
    try {
        const resultado = await db.query(
            `SELECT * FROM transacoes
             WHERE usuario_id = $1
             ORDER BY data_transacao DESC, id DESC`,
            [req.usuario.id]
        );

        res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao listar transações"
        });
    }
});

// CADASTRAR TRANSAÇÃO
router.post("/", async (req, res) => {
    try {
        const { descricao, categoria, tipo, valor } = req.body;

        if (
            typeof descricao !== "string" ||
            !descricao.trim() ||
            descricao.length > 150 ||
            typeof categoria !== "string" ||
            !categoria.trim() ||
            categoria.length > 80 ||
            !["entrada", "saida"].includes(tipo) ||
            typeof valor !== "number" ||
            !Number.isFinite(valor) ||
            valor <= 0
        ) {
            return res.status(400).json({
                erro: "Dados da transação inválidos"
            });
        }

        const resultado = await db.query(
            `INSERT INTO transacoes
             (usuario_id, descricao, categoria, tipo, valor)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                req.usuario.id,
                descricao.trim(),
                categoria.trim(),
                tipo,
                valor
            ]
        );

        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao cadastrar transação"
        });
    }
});

// ATUALIZAR TRANSAÇÃO
router.put("/:id", async (req, res) => {
    try {
        const { descricao, categoria, tipo, valor } = req.body;
        const id = Number(req.params.id);

        if (
            !Number.isSafeInteger(id) ||
            id <= 0 ||
            typeof descricao !== "string" ||
            !descricao.trim() ||
            descricao.length > 150 ||
            typeof categoria !== "string" ||
            !categoria.trim() ||
            categoria.length > 80 ||
            !["entrada", "saida"].includes(tipo) ||
            typeof valor !== "number" ||
            !Number.isFinite(valor) ||
            valor <= 0
        ) {
            return res.status(400).json({
                erro: "Dados inválidos"
            });
        }

        const resultado = await db.query(
            `UPDATE transacoes
             SET descricao = $1,
                 categoria = $2,
                 tipo = $3,
                 valor = $4
             WHERE id = $5 AND usuario_id = $6
             RETURNING *`,
            [
                descricao.trim(),
                categoria.trim(),
                tipo,
                valor,
                id,
                req.usuario.id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Transação não encontrada"
            });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao atualizar transação"
        });
    }
});

module.exports = router;
