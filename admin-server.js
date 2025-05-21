const express = require("express");
const cors = require("cors");
const amqp = require("amqplib");
const http = require("http");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3002;

// Stockage des informations sur les workers
const workers = {
  add: { active: false, processing: false, lastSeen: null, operations: 0 },
  sub: { active: false, processing: false, lastSeen: null, operations: 0 },
  mul: { active: false, processing: false, lastSeen: null, operations: 0 },
  div: { active: false, processing: false, lastSeen: null, operations: 0 },
};

let operationsCount = 0;

// Fonction pour vérifier l'état de RabbitMQ
async function checkRabbitMQStatus() {
  try {
    const connection = await amqp.connect("amqp://user:password@localhost");
    const channel = await connection.createChannel();

    // Obtenir des informations sur la queue de résultats
    const { messageCount } = await channel.assertQueue("results", {
      durable: true,
    });

    await channel.close();
    await connection.close();

    return {
      connected: true,
      queues: {
        results: {
          messageCount,
        },
      },
    };
  } catch (error) {
    console.error("Erreur lors de la vérification de RabbitMQ:", error);
    return { connected: false, error: error.message };
  }
}

// API pour vérifier le statut de RabbitMQ
app.get("/api/rabbitmq-status", async (req, res) => {
  try {
    const status = await checkRabbitMQStatus();

    // Marquer les workers inactifs si pas de ping depuis plus de 10 secondes
    Object.keys(workers).forEach((workerType) => {
      if (workers[workerType].lastSeen) {
        const timeSinceLastSeen = Date.now() - workers[workerType].lastSeen;
        if (timeSinceLastSeen > 10000) {
          workers[workerType].active = false;
          workers[workerType].processing = false;
        }
      }
    });

    const workersCount = Object.values(workers).filter((w) => w.active).length;

    res.json({
      rabbitmq: status,
      workers,
      workersCount,
      operationsCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API pour les workers pour signaler leur état
app.post("/api/worker-heartbeat", (req, res) => {
  const { workerType, processing } = req.body;

  if (!workerType || !workers[workerType]) {
    return res.status(400).json({ error: "Type de worker invalide" });
  }

  workers[workerType].active = true;
  workers[workerType].processing = processing;
  workers[workerType].lastSeen = Date.now();

  res.json({ success: true });
});

// API pour signaler une opération terminée
app.post("/api/operation-completed", (req, res) => {
  const { workerType } = req.body;

  if (workers[workerType]) {
    workers[workerType].operations++;
    operationsCount++;
  }

  res.json({ success: true });
});

// Démarrer le serveur d'administration
app.listen(PORT, () => {
  console.log(
    `📊 Serveur d'administration démarré sur http://localhost:${PORT}`
  );
});
