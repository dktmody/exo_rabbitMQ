// result_consumer.js
import dotenv from "dotenv";
import amqp from "amqplib";
import { RESULTS_QUEUE } from "./constants/index.js";

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  console.error(
    "❌ Veuillez définir la variable d'environnement RABBITMQ_URL avec l'URL de RabbitMQ."
  );
  process.exit(1);
}

async function startConsumer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(RESULTS_QUEUE, { durable: true });
    const results = {};

    console.log(
      `📥 En attente des résultats dans la queue "${RESULTS_QUEUE}"...`
    );

    channel.consume(RESULTS_QUEUE, (msg) => {
      try {
        const result = JSON.parse(msg.content.toString());
        const id = msg.properties.correlationId;
        results[id] = results[id] || [];
        const source = result.source || "producer";

        const src =
          source === "cli" ? "CLI" : source === "web" ? "Web" : "Producer";
        if (result.op === "all") {
          results[id] = results[id] || [];
          results[id].push(result);
          if (results[id].length === 4) {
            console.log(`✅ ${src} All results for ${id}:`, results[id]);
            delete results[id];
          }
        } else {
          console.log(`✅ ${src} Result: ${JSON.stringify(result)}`);
        }
        channel.ack(msg);
      } catch (err) {
        console.error("❌ Erreur du consumer :", err);
        channel.nack(msg, false, true);
      }
    });
  } catch (error) {
    console.error("❌ Erreur de connexion à RabbitMQ :", error);
    setTimeout(startConsumer, 5000);
  }
}

startConsumer();
