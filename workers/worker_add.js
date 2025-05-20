// workers/worker_add.js
const amqp = require("amqplib");

const Exchange = "operations";
const ROUTING_KEY = "add";
const RESULT_QUEUE = "results";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

    await channel.bindQueue(queue, Exchange, ROUTING_KEY);
    console.log(`🔧 [worker_add] En attente de messages dans "${queue}"...`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        const { n1, n2, op } = JSON.parse(content);
        console.log(`🔧 [worker_add] Reçu : ${n1} + ${n2} (op: ${op})`);

        const resultMsg = {
          n1,
          n2,
          op: "add",
          result: n1 + n2,
        };

        await channel.assertQueue(RESULT_QUEUE, { durable: true });
        channel.sendToQueue(
          RESULT_QUEUE,
          Buffer.from(JSON.stringify(resultMsg)),
          {
            persistent: true,
          }
        );
        console.log(`✅ [worker_add] Résultat envoyé : ${resultMsg.result}`);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("❌ Erreur worker_add :", error);
  }
}

startWorker();
