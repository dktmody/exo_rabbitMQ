const express = require("express");
const amqp = require("amqplib");

const app = express();
const PORT = 3000;
const EXCHANGE = "operations";

app.use(express.json());
// Ajoutez ces lignes à votre server.js
const cors = require("cors");
app.use(cors()); // Avant app.use(express.json());
app.post("/api/produce", async (req, res) => {
  const { n1, n2, op } = req.body;

  if (!n1 || !n2 || !op) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    const connection = await amqp.connect("amqp://user:password@localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, "direct", { durable: true });

    const message = { n1: Number.parseInt(n1), n2: Number.parseInt(n2), op };
    const msgBuffer = Buffer.from(JSON.stringify(message));

    if (op === "all") {
      // biome-ignore lint/complexity/noForEach: <explanation>
      ["add", "sub", "mul", "div"].forEach((operation) => {
        channel.publish(EXCHANGE, operation, msgBuffer, { persistent: true });
      });
    } else {
      channel.publish(EXCHANGE, op, msgBuffer, { persistent: true });
    }

    await channel.close();
    await connection.close();

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Erreur lors de l'envoi à RabbitMQ :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
