# ESP32-Sensores

Projeto em desenvolvimento com ESP32, LDR, DHT11, API em Node.js e banco MySQL. As duas primeiras etapas abaixo recuperam os **códigos originais dos testes isolados** do README anterior. A integração final dos sensores com o envio à API ainda é um desafio pendente.

As fotos e capturas estão em `_assets/images` e `_assets/screenshots`. Cada imagem aparece junto da etapa que ilustra. Os comandos de terminal deste tutorial são para o **Prompt de Comando do Windows (CMD)**.

## 1. Teste do LDR com LED

A montagem registrada nas fotos usa ESP32, protoboard, LDR e LED. Confira a ligação dos componentes e use resistor para limitar a corrente do LED. As fotos documentam o teste realizado; confira os pinos pelo código antes de montar.

![Visão geral da montagem do LDR, LED e ESP32](./_assets/images/image1.jpg)

![Detalhe do LDR e do LED na protoboard](./_assets/images/image2.jpg)

Na Arduino IDE, selecione a placa e a porta do ESP32. Crie um sketch para **este teste isolado** com o código que já constava no README:

```cpp
const int ldrPin = 4; // Pino ADC onde o LDR está conectado
const int ledPin = 18; // Pino do LED para acionar

void setup() {
  Serial.begin(9600); // Inicia a comunicação serial
  pinMode(ledPin, OUTPUT); // Configura o pino do LED como saída
  pinMode(ldrPin, INPUT);
}

void loop() {
  int ldrValue = analogRead(ldrPin); // Lê o valor do sensor LDR
  ldrValue = map(ldrValue, 0, 5000, 30, 0);

  Serial.print("Valor do LDR: ");
  Serial.println(ldrValue);

  if (ldrValue < 26) { // Se estiver mais escuro
    digitalWrite(ledPin, HIGH); // Liga o LED
  } else { // Se estiver mais claro
    digitalWrite(ledPin, LOW); // Desliga o LED
  }

  delay(500); // Aguarda 500 milissegundos antes da próxima leitura
}
```

Envie o sketch ao ESP32 e abra o Monitor Serial em **9600 baud**, a mesma velocidade definida em `Serial.begin(9600)`. A captura mostra a leitura do LDR e o LED acionado no teste:

![Código do teste do LDR e valores no Monitor Serial](./_assets/screenshots/screenshot1.png)

Este exemplo usa GPIO 4 para o LDR e GPIO 18 para o LED. São os pinos do teste original; a futura integração com Wi-Fi precisará rever a escolha do pino analógico.

## 2. Teste do DHT11

A foto abaixo mostra a montagem usada no teste separado do DHT11:

![Montagem do DHT11 com o ESP32](./_assets/images/image3.jpg)

Na Arduino IDE, abra o **Gerenciador de Bibliotecas**, procure **DHT sensor library** da Adafruit e instale-a. Se a IDE solicitar, instale também **Adafruit Unified Sensor**.

![DHT sensor library no Gerenciador de Bibliotecas](./_assets/screenshots/screenshot2.png)

Crie outro sketch para o DHT11. Este é o **código original** recuperado do README anterior:

```cpp
#include "DHT.h"

#define DHTPIN 18
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE); // constructor to declare our sensor

void setup() {

  Serial.begin(115200);
  Serial.println("O ESP32 Esta funcionando");

  dht.begin();
}

void loop() {

  delay(1000);

  float h = dht.readHumidity();
  //Faz a leitura da umidade em %.
  float t = dht.readTemperature();
  //Faz a leitura da temperatura em Celsius
  float f = dht.readTemperature(true);
  //Faz a leiturada temperatura em Fahrenheit

  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println("Sem receber dados do sensor DHT11");
    return;
    //Trata erros de leitura do sensor
  }

  Serial.print("Umidade: ");
  Serial.print(h);
  Serial.print("%  Temperatura: ");
  Serial.print(t);
  Serial.print("°C, ");
  Serial.print(f);
  Serial.println("°F");

}
```

Envie o sketch e ajuste o Monitor Serial para **115200 baud**, de acordo com `Serial.begin(115200)`. A primeira captura mostra onde selecionar a velocidade; a segunda mostra as leituras de umidade e temperatura.

![Seleção de 115200 baud no Monitor Serial](./_assets/screenshots/screenshot3.png)

![Leituras do DHT11 no Monitor Serial](./_assets/screenshots/screenshot4.png)

Os dois códigos acima têm funções `setup()` e `loop()` próprias. Execute-os separadamente nesta fase.

## 3. Prepare o banco MySQL e a API

Tenha o MySQL em execução e crie o banco `medicoes`. Se o cliente `mysql` estiver disponível no CMD:

```cmd
mysql -u root -e "CREATE DATABASE IF NOT EXISTS medicoes;"
```

Se o usuário `root` exigir senha, use a opção `-p` e ajuste a URL de conexão abaixo. Você também pode criar o banco em uma ferramenta gráfica do MySQL.

Abra o CMD na **pasta raiz do projeto**. Entre na pasta da API e edite o arquivo de ambiente:

```cmd
cd api_iot
notepad .env
```

Use este conteúdo no `api_iot/.env`:

```dotenv
PORT=3000
DATABASE_URL="mysql://root@localhost:3306/medicoes"
```

Essa URL corresponde ao MySQL local com usuário `root` sem senha. Nesta etapa, `api_iot/server.js` fixa a porta 3000; alterar somente `PORT` no `.env` não muda a porta do servidor.

No mesmo CMD, execute:

```cmd
npm install
npx prisma db push
npx prisma generate
npm run dev
```

`prisma db push` cria a tabela `Medicao` a partir do esquema atual. Mantenha o CMD aberto quando aparecer `Servidor respondendo em: http://localhost:3000`. Para interromper o servidor, pressione `Ctrl+C`.

## 4. Teste as rotas da API

Abra **outro CMD** enquanto o servidor continua em execução. Envie uma medição de teste:

```cmd
curl.exe -X POST http://localhost:3000/medicoes -H "Content-Type: application/json" -d "{\"temperatura\":25.5,\"umidade\":60.2,\"luminosidade\":300}"
```

A resposta deve trazer a medição criada com `id` e `data`. O terminal da API mostra `Medição recebida:`. Para listar as medições salvas:

```cmd
curl.exe http://localhost:3000/listar
```

As rotas disponíveis agora são **`POST /medicoes`** e **`GET /listar`**.

## 5. Prévia da parte web

Com a API em execução, abra a página pelo CMD:

```cmd
start http://localhost:3000/
```

A página consulta `GET /listar` e mostra a última medição e gráficos. Os gráficos usam Chart.js carregado pela internet. **A imagem abaixo é somente uma prévia da parte web**, não o resultado final do projeto.

![Prévia da página web de medições](./_assets/screenshots/screenshot6.png)

## 6. Desafio ainda pendente

O próximo passo é criar o programa que reúna as leituras dos sensores, conecte o ESP32 ao Wi-Fi e envie os valores para `POST http://IP_DO_COMPUTADOR:3000/medicoes`. No CMD, `ipconfig` mostra o IPv4 do computador. ESP32 e computador devem estar na mesma rede; `localhost` não aponta para o computador quando a requisição parte do ESP32.

O código final dessa integração **não é apresentado neste tutorial**.

<details>
<summary>Comando para abrir o arquivo de apoio depois de tentar o desafio</summary>

No CMD aberto na pasta raiz do projeto:

```cmd
start "" "exemplo.ino"
```

</details>
