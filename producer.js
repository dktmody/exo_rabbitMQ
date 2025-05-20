// producer.js
const amqp = require("amqplib");
const { randomInt } = require("crypto");

const EXCHANGE = "operations";
const OPERATIONS = ["add", "sub", "mul", "div", "all"];

async function connectAndProduce() {
  try {
    const connection = await amqp.connect("amqp://user:password@localhost");
    const channel = await connection.createChannel();

    // // for (const queue of QUEUES) {
    // //   await channel.assertQueue(queue, { durable: true });
    // }

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });

    setInterval(() => {
      const n1 = randomInt(1, 100);
      const n2 = randomInt(1, 100);
      const op = OPERATIONS[randomInt(0, OPERATIONS.length)];

      const message = {
        n1,
        n2,
        op,
      };

      const msgBuffer = Buffer.from(JSON.stringify(message));

      //   if (op === 'all') {

      //     // Envoie du message à toutes les queues
      //     for (const queue of QUEUES) {
      //       channel.sendToQueue(queue, msgBuffer, { persistent: true });
      //     }
      //     console.log(`Envoyé [ALL] : ${JSON.stringify(message)}`);
      //   } else {
      //     const queueName = `rpc_${op}`;
      //     channel.sendToQueue(queueName, msgBuffer, { persistent: true });
      //     console.log(`Envoyé [${op}] : ${JSON.stringify(message)}`);
      //   }

      // }, 5000);

      channel.publish(EXCHANGE, op, msgBuffer, { persistent: true });
        console.log(`Envoyé [${op}] : ${JSON.stringify(message)}`);
    }, 5000);
  } catch (error) {
    console.error("Erreur de connexion à RabbitMQ :", error);
  }
}

connectAndProduce();
