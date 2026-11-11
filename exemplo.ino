#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

const char* wifiNome = "TI_SENAI2";
const char* wifiSenha = "senai2025";
const char* urlApi = "http://192.168.1.150:3000/medicoes";

#define DHTPIN 18
#define DHTTYPE DHT11
#define LDRPIN 34

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Iniciando ESP32...");

  dht.begin();
  pinMode(LDRPIN, INPUT);

  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiNome, wifiSenha);

  Serial.print("Conectando ao Wi-Fi");

  for (int tentativa = 0; WiFi.status() != WL_CONNECTED && tentativa < 20; tentativa++) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(" conectado! IP do ESP32: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.print(" sem conexao. Status Wi-Fi: ");
    Serial.println(WiFi.status());
  }

  delay(2000);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi desconectado. Tentando reconectar...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  float temperatura = dht.readTemperature();
  float umidade = dht.readHumidity();
  int luminosidade = analogRead(LDRPIN);

  if (isnan(temperatura) || isnan(umidade)) {
    Serial.println("Erro ao ler o DHT11. Verifique o tipo e a ligacao do sensor.");
  } else {
    String dados = "{\"temperatura\":" + String(temperatura, 1) +
                   ",\"umidade\":" + String(umidade, 1) +
                   ",\"luminosidade\":" + String(luminosidade) + "}";

    Serial.print("Medicao: ");
    Serial.println(dados);

    HTTPClient http;
    http.setTimeout(5000);

    Serial.print("Enviando para: ");
    Serial.println(urlApi);

    if (!http.begin(urlApi)) {
      Serial.println("Nao foi possivel iniciar a requisicao HTTP.");
    } else {
      http.addHeader("Content-Type", "application/json");

      int resposta = http.POST(dados);

      Serial.print("Resposta da API: ");
      Serial.println(resposta);

      if (resposta > 0) {
        Serial.println(http.getString());
      } else {
        Serial.println(http.errorToString(resposta));
      }

      http.end();
    }
  }

  delay(5000);
}
