// result_consumer.js
const amqp = require("amqplib");
const express = require("express");
const cors = require("cors");

// Stockage des résultats en mémoire (simple)
const results = [];
const MAX_RESULTS = 20; // Limiter le nombre de résultats stockés

// Créer un serveur Express simple
const app = express();
app.use(cors());

// Route pour récupérer les résultats
app.get("/results", (req, res) => {
  res.json(results);
});
// Route pour effacer tous les résultats
app.delete("/results", (req, res) => {
  results.length = 0;
  res.json({ success: true, message: "Tous les résultats ont été effacés" });
});

// Route pour supprimer un résultat spécifique par index
app.delete("/results/:index", (req, res) => {
  const index = parseInt(req.params.index);

  if (isNaN(index) || index < 0 || index >= results.length) {
    return res
      .status(404)
      .json({ success: false, message: "Résultat non trouvé" });
  }

  results.splice(index, 1);
  res.json({ success: true, message: "Résultat supprimé" });
});

// Démarrer le serveur sur un port différent pour éviter les conflits
const PORT = 3001;
app.listen(PORT, () => {
  console.log(
    `📊 Serveur de résultats démarré sur http://localhost:${PORT}/results`
  );
});

async function connectAndConsume() {
  try {
    const connection = await amqp.connect("amqp://user:password@localhost");
    const channel = await connection.createChannel();

    const queue = "results";

    await channel.assertQueue(queue, { durable: true });

    console.log(
      `📥 En attente des résultats dans la queue "${RESULTS_QUEUE}"...`
    );

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        try {
          const result = JSON.parse(content);
          console.log(`✅ Résultat reçu : ${JSON.stringify(result)}`);

          // Ajouter un horodatage au résultat
          result.timestamp = new Date().toLocaleTimeString();

          // Ajouter au début de la liste (les plus récents d'abord)
          results.unshift(result);

          // Limiter la taille de la liste
          if (results.length > MAX_RESULTS) {
            results.pop();
          }
        } catch (err) {
          console.error("❌ Erreur lors du parsing du message :", err);
        }
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Erreur de connexion à RabbitMQ :", error);
  }
}

startConsumer();
