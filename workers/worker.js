// worker.js
import dotenv from 'dotenv';
import amqp from 'amqplib';
import { EXCHANGE, RESULTS_QUEUE } from '../constants/index.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  console.error(
    "❌ Veuillez définir la variable d'environnement RABBITMQ_URL avec l'URL de RabbitMQ."
  );
  process.exit(1);
}

const OPERATION = process.argv[2]?.split("=")[1];

async function startWorker() {
  let connection;
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.prefetch(1); // Process one message at a time
    await channel.assertExchange(EXCHANGE, "direct", { durable: true });
    await channel.assertQueue(RESULTS_QUEUE, { durable: true });

    const queue = `rpc_${OPERATION}`;
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, EXCHANGE, `${EXCHANGE}.${OPERATION}`);
    await channel.bindQueue(queue, EXCHANGE, `${EXCHANGE}.all`);

    channel.consume(queue, async (msg) => {
      try {
         const { n1, n2, op, id, source = 'producer' } = JSON.parse(msg.content.toString());
        if (op !== OPERATION && op !== 'all') {
          return; // Ignore irrelevant ops
        }

        const delay = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
         console.log(`Processing ${op} for ${n1} and ${n2} with delay ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));

        let result;
        switch (OPERATION) {
          case 'add': result = n1 + n2; break;
          case 'sub': result = n1 - n2; break;
          case 'mul': result = n1 * n2; break;
          case 'div': result = n2 !== 0 ? n1 / n2 : 'Error: Division by zero'; break;
          default: throw new Error('Invalid operation');
        }

        const response = { n1, n2, op: OPERATION, result, id, source };
        channel.sendToQueue(
          RESULTS_QUEUE,
          Buffer.from(JSON.stringify(response)),
          {
            persistent: true,
            correlationId: id,
          }
        );
        channel.ack(msg);
        console.log(`Processed: ${JSON.stringify(response)}`);
      } catch (err) {
        console.error("Worker error:", err);
        channel.nack(msg, false, true); // Requeue message
      }
    });
  } catch (err) {
    console.error("Worker connection failed:", err);
    setTimeout(startWorker, 5000); // Retry after 5s
  } finally {
    if (connection) await connection.close();
  }
}

startWorker();
