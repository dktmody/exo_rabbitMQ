// producer.js
const amqp = require("amqplib");
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const { randomInt } = require("crypto");

const EXCHANGE = "operations";
const OPERATIONS = ["add", "sub", "mul", "div", "all"];

async function connectAndProduce() {
  try {
    const connection = await amqp.connect("amqp://user:password@localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, "direct", { durable: true });

    const args = process.argv.slice(2);

    if (args.length === 3) {
      const [n1, n2, op] = args;
      const message = {
        n1: Number.parseInt(n1),
        n2: Number.parseInt(n2),
        op,
      };

      if (!OPERATIONS.includes(op)) {
        console.error(
          `❌ Opération invalide : "${op}". Opérations valides : ${OPERATIONS.join(
            ", "
          )}`
        );
        process.exit(1);
      }

      const msgBuffer = Buffer.from(JSON.stringify(message));

      channel.publish(EXCHANGE, op, msgBuffer, { persistent: true });
      console.log(`✅ Envoyé [${op}] : ${JSON.stringify(message)}`);

      // Ferme la connexion après l'envoi du message
      await channel.close();
      await connection.close();
      process.exit(0); // Quitte le programme proprement
    } else {
      // Mode aléatoire : aucun argument fourni
      console.log("🔄 Aucun argument fourni. Passage en mode aléatoire...");

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

        channel.publish(EXCHANGE, op, msgBuffer, { persistent: true });
        console.log(`Envoyé [${op}] : ${JSON.stringify(message)}`);
      }, 5000);
    }
  } catch (error) {
    console.error("Erreur de connexion à RabbitMQ :", error);
  }
}

connectAndProduce();
