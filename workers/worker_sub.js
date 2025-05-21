// workers/worker_add.js
const amqp = require("amqplib");

const Exchange = "operations";
const ROUTING_KEYS = ["sub", "all"];
const RESULT_QUEUE = "results";

const http = require("http");

// Fonction pour envoyer un heartbeat au serveur d'administration
async function sendHeartbeat(processing = false) {
  try {
    const workerType = "sub";

    const data = JSON.stringify({
      workerType,
      processing,
    });

    const options = {
      hostname: "localhost",
      port: 3002,
      path: "/api/worker-heartbeat",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = http.request(options, (res) => {
      // Heartbeat envoyé
    });

    req.on("error", (error) => {
      console.error("Erreur lors de l'envoi du heartbeat:", error);
    });

    req.write(data);
    req.end();
  } catch (error) {
    console.error("Erreur lors de l'envoi du heartbeat:", error);
  }
}

// Fonction pour signaler une opération terminée
async function reportCompletedOperation() {
  try {
    const workerType = "add"; // Changer selon le worker: 'add', 'sub', 'mul', 'div'

    const data = JSON.stringify({
      workerType,
    });

    const options = {
      hostname: "localhost",
      port: 3002,
      path: "/api/operation-completed",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = http.request(options);
    req.on("error", (error) => {
      console.error("Erreur lors du signalement d'opération terminée:", error);
    });

    req.write(data);
    req.end();
  } catch (error) {
    console.error("Erreur lors du signalement d'opération terminée:", error);
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function startWorker() {
  try {
    const connection = await amqp.connect("amqp://user:password@localhost");
    const channel = await connection.createChannel();

    await channel.assertExchange(Exchange, "direct", { durable: true });
    const { queue } = await channel.assertQueue("", {
      exclusive: true,
      durable: true,
    });

    // biome-ignore lint/complexity/noForEach: <explanation>
    ROUTING_KEYS.forEach((key) => {
      channel.bindQueue(queue, Exchange, key);
    });
    console.log(`🔧 [worker_sub] En attente de messages dans "${queue}"...`);

    setInterval(() => sendHeartbeat(false), 5000);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        const { n1, n2, op } = JSON.parse(content);
        console.log(`🔧 [worker_sub] Reçu : ${n1} - ${n2} (op: ${op})`);

        // Génère un délai aléatoire entre 5 et 15 secondes
        const delay = getRandomDelay(5000, 15000);
        console.log(
          `⏳ [worker_sub] Traitement en cours... (${delay / 1000} secondes)`
        );

        sendHeartbeat(true);

        // Simule un traitement long
        await sleep(delay);

        const resultMsg = {
          n1,
          n2,
          op: "sub",
          result: n1 - n2,
        };

        await channel.assertQueue(RESULT_QUEUE, { durable: true });
        channel.sendToQueue(
          RESULT_QUEUE,
          Buffer.from(JSON.stringify(resultMsg)),
          {
            persistent: true,
          }
        );
        console.log(`✅ [worker_sub] Résultat envoyé : ${resultMsg.result}`);
        channel.ack(msg);

        sendHeartbeat(false);
        reportCompletedOperation();
      }
    });
  } catch (error) {
    console.error("❌ Erreur worker_sub :", error);
  }
}

startWorker();
