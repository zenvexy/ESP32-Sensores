const limites = {
  temperatura: [20, 28],
  umidade: [70, 90],
  luminosidade: [500, 3000]
};
const url = "http://localhost:3000/listar";

function mostrarValores(medicao) {
  document.getElementById("temperatura").textContent = medicao.temperatura.toFixed(1);
  document.getElementById("umidade").textContent = medicao.umidade.toFixed(1);
  document.getElementById("luminosidade").textContent = medicao.luminosidade;
  document.getElementById("status").textContent =
    "Última medição: " + new Date(medicao.data).toLocaleString("pt-BR");
}

function mostrarAlerta(medicao) {
  const foraDoLimite = [];

  for (const sensor of ["temperatura", "umidade", "luminosidade"]) {
    const [minimo, maximo] = limites[sensor];
    if (medicao[sensor] < minimo || medicao[sensor] > maximo) {
      foraDoLimite.push(sensor);
    }
  }

  const alerta = document.getElementById("alerta");
  alerta.classList.toggle("problema", foraDoLimite.length > 0);
  alerta.textContent = foraDoLimite.length
    ? "Atenção: " + foraDoLimite.join(", ") + " fora do limite."
    : "Tudo dentro dos limites definidos.";
}

async function carregarMedicoes() {
  const status = document.getElementById("status");

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Não foi possível consultar a API.");

    const medicoes = (await resposta.json())
      .sort((a, b) => a.id - b.id)
      .slice(-60);

    if (medicoes.length === 0) {
      status.textContent = "Ainda não há medições salvas.";
      return;
    }

    const ultima = medicoes[medicoes.length - 1];
    mostrarValores(ultima);
    mostrarAlerta(ultima);
    atualizarGraficos(medicoes);
  } catch (erro) {
    status.textContent = erro.message;
  }
}

carregarMedicoes();
setInterval(carregarMedicoes, 10000);
