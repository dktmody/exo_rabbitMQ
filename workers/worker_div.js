// workers/worker_add.js
const amqp = require("amqplib");

const Exchange = "operations";
const ROUTING_KEYS = ["div", "all"];
const RESULT_QUEUE = "results";

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

    console.log(
      `🔧 [worker_div] En attente de messages pour "${ROUTING_KEYS.join(
        ", "
      )}"...`
    );

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        const { n1, n2, op } = JSON.parse(content);
        console.log(`🔧 [worker_div] Reçu : ${n1} / ${n2} (op: ${op})`);

        // Génère un délai aléatoire entre 5 et 15 secondes
        const delay = getRandomDelay(5000, 15000);
        console.log(
          `⏳ [worker_div] Traitement en cours... (${delay / 1000} secondes)`
        );

        // Simule un traitement long
        await sleep(delay);

        // Vérifie la division par zéro
        let resultMsg;
        if (n2 === 0) {
          resultMsg = {
            n1,
            n2,
            op: "div",
            error: "Division par zéro impossible",
          };
          console.error(
            `❌ [worker_div] Erreur : Division par zéro (${n1} / ${n2})`
          );
        } else {
          resultMsg = {
            n1,
            n2,
            op: "div",
            result: n1 / n2,
          };
          console.log(`✅ [worker_div] Résultat calculé : ${resultMsg.result}`);
        }

        await channel.assertQueue(RESULT_QUEUE, { durable: true });
        channel.sendToQueue(
          RESULT_QUEUE,
          Buffer.from(JSON.stringify(resultMsg)),
          {
            persistent: true,
          }
        );
        console.log(`✅ [worker_div] Résultat envoyé : ${resultMsg.result}`);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("❌ Erreur worker_div :", error);
  }
}

startWorker();
