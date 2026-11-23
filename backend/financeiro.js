
function calcularResumo(transacoes) {
    let entradas = 0;
    let saidas = 0;

    for (const transacao of transacoes) {
        const valor = Math.round(Number(transacao.valor) * 100);

        if (transacao.tipo === "entrada") {
            entradas += valor;
        }

        if (transacao.tipo === "saida") {
            saidas += valor;
        }
    }

    return {
        entradas: entradas / 100,
        saidas: saidas / 100,
        saldo: (entradas - saidas) / 100
    };
}

module.exports = { calcularResumo };
