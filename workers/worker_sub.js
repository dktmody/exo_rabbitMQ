// workers/worker_sub.js
const amqp = require('amqplib');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startWorker() {
  try {
    const connection = await amqp.connect('amqp://user:password@localhost');
    const channel = await connection.createChannel();

    const inputQueue = 'rpc_sub';
    const resultQueue = 'results';

    await channel.assertQueue(inputQueue, { durable: true });
    await channel.assertQueue(resultQueue, { durable: true });

    console.log(`🛠️  [worker_sub] En attente de messages dans "${inputQueue}"...`);

    channel.consume(inputQueue, async (msg) => {
      if (msg !== null) {
        const content = msg.content.toString();
        let data;

        try {
          data = JSON.parse(content);
        } catch (err) {
          console.error('❌ Erreur parsing JSON :', err);
          channel.ack(msg);
          return;
        }

        const { n1, n2, op } = data;

        if (op !== 'sub' && op !== 'all') {
          channel.ack(msg); 
          return;
        }

        console.log(`🔧 [worker_sub] Reçu : ${n1} - ${n2} (op: ${op})`);

        const waitTime = Math.floor(Math.random() * 10000) + 5000;
        await sleep(waitTime);

        const resultMsg = {
          n1,
          n2,
          op: 'sub',
          result: n1 - n2
        };

        channel.sendToQueue(resultQueue, Buffer.from(JSON.stringify(resultMsg)), {
          persistent: true
        });

        console.log(`✅ [worker_sub] Résultat envoyé après ${waitTime / 1000}s : ${resultMsg.result}`);
        channel.ack(msg);
      }
    }, {
      noAck: false
    });

  } catch (error) {
    console.error('❌ Erreur worker_sub :', error);
  }
}

startWorker();
