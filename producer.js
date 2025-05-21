// producer.js
import dotenv from "dotenv";
import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";
import { getRoutingKey, publishMessage } from "./utils/index.js";
import { EXCHANGE, OPERATIONS, INTERVAL } from "./constants/index.js";

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  console.error(
    "❌ Veuillez définir la variable d'environnement RABBITMQ_URL avec l'URL de RabbitMQ."
  );
  process.exit(1);
}

async function startProducer() {
  try {
    let routingKey;
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const args = process.argv.slice(2);
    await channel.assertExchange(EXCHANGE, "direct", { durable: true });

    if (args.length === 3) {
      const [n1, n2, op] = args;
      if (!OPERATIONS.includes(op)) {
        console.error(
          `❌ Opération invalide : "${op}". Opérations valides : ${OPERATIONS.join(
            ", "
          )}`
        );
        process.exit(1);
      }

      const msg = {
        n1: Number.parseInt(n1),
        n2: Number.parseInt(n2),
        op,
        id: uuidv4(),
      };
      routingKey = getRoutingKey(op);
      publishMessage(channel, msg, routingKey);
      console.log(`✅ Envoyé: ${JSON.stringify(msg)} ==> ${routingKey}`);

      // Ferme la connexion après l'envoi du message
      await channel.close();
      await connection.close();
      process.exit(0); // Quitte le programme proprement
    } else {
      // Mode aléatoire : aucun argument fourni
      console.log("🔄 Aucun argument fourni. Passage en mode aléatoire...");

      setInterval(() => {
        try {
          const op = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
          const n1 = Math.floor(Math.random() * 100);
          const n2 = Math.floor(Math.random() * 100) || 1; // Avoid division by zero
          const msg = { n1, n2, op, id: uuidv4() };
          routingKey = getRoutingKey(op);

          publishMessage(channel, msg, routingKey);
          console.log(`✅ Envoyé: ${JSON.stringify(msg)} ==> ${routingKey}`);
        } catch (err) {
          console.error("❌ Erreur lors de l'envoi du message :", err);
        }
      }, INTERVAL);
    }
  } catch (error) {
    console.error("Erreur de connexion à RabbitMQ :", error);
    setTimeout(startProducer, 5000); // Réessayer après 5 secondes
  }
}

startProducer();
