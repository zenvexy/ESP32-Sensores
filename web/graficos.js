const graficos = {};

function criarGrafico(id, cor) {
  return new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels: [],
      datasets: [{ data: [], borderColor: cor, tension: 0.2 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  });
}

function atualizarGraficos(medicoes) {
  const horarios = medicoes.map((medicao) =>
    new Date(medicao.data).toLocaleTimeString("pt-BR")
  );

  for (const sensor of Object.keys(graficos)) {
    const grafico = graficos[sensor];
    grafico.data.labels = horarios;
    grafico.data.datasets[0].data = medicoes.map((medicao) => medicao[sensor]);
    grafico.update();
  }
}

if (typeof Chart === "undefined") {
  document.getElementById("avisoGraficos").textContent =
    "Os gráficos precisam de internet para carregar a biblioteca Chart.js.";
} else {
  graficos.temperatura = criarGrafico("graficoTemperatura", "#ea3301");
  graficos.umidade = criarGrafico("graficoUmidade", "#0079e4");
  graficos.luminosidade = criarGrafico("graficoLuminosidade", "#dfed1f");
}
