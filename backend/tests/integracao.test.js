
const test = require("node:test");
const assert = require("node:assert/strict");

const API = "http://localhost:3002";

test("API e banco funcionando", async () => {
    const resposta = await fetch(`${API}/api/health`);
    const dados = await resposta.json();

    assert.equal(resposta.status, 200);
    assert.equal(dados.banco, "conectado");
});

test("Bloqueia acesso sem JWT", async () => {
    const resposta = await fetch(`${API}/api/transacoes`);

    assert.equal(resposta.status, 401);
});
