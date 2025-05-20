// result_consumer.js
const amqp = require('amqplib');

async function connectAndConsume() {
  try {
    const connection = await amqp.connect('amqp://user:password@localhost');
    const channel = await connection.createChannel();

    const queue = 'results';

    await channel.assertQueue(queue, { durable: true });

    console.log(`📥 En attente des résultats dans la queue "${queue}"...`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        try {
          const result = JSON.parse(content);
          console.log(`✅ Résultat reçu : ${JSON.stringify(result)}`);
        } catch (err) {
          console.error("❌ Erreur lors du parsing du message :", err);
        }
        channel.ack(msg); 
      }
    });
  } catch (error) {
    console.error('Erreur de connexion à RabbitMQ :', error);
  }
}

connectAndConsume();
