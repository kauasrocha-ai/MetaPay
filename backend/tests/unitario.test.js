
const test = require("node:test");
const assert = require("node:assert/strict");
const { calcularResumo } = require("../financeiro");

test("Calcula entradas e saídas", () => {
    const resumo = calcularResumo([
        { tipo: "entrada", valor: 1000 },
        { tipo: "saida", valor: 200 }
    ]);

    assert.equal(resumo.entradas, 1000);
    assert.equal(resumo.saidas, 200);
    assert.equal(resumo.saldo, 800);
});

test("Calcula valores com centavos", () => {
    const resumo = calcularResumo([
        { tipo: "entrada", valor: 100.50 },
        { tipo: "saida", valor: 25.30 }
    ]);

    assert.equal(resumo.saldo, 75.20);
});

test("Retorna zero sem transações", () => {
    const resumo = calcularResumo([]);

    assert.equal(resumo.saldo, 0);
});
