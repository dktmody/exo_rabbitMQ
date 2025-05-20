// workers/worker_add.js
const amqp = require('amqplib');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startWorker() {
  try {
    const connection = await amqp.connect('amqp://user:password@localhost');
    const channel = await connection.createChannel();

    const inputQueue = 'rpc_add';
    const resultQueue = 'results';

    await channel.assertQueue(inputQueue, { durable: true });
    await channel.assertQueue(resultQueue, { durable: true });

    console.log(`🛠️  [worker_add] En attente de messages dans "${inputQueue}"...`);

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

        if (op !== 'add' && op !== 'all') {
          channel.ack(msg); // Ne traite pas ce message
          return;
        }

        console.log(`🔧 [worker_add] Reçu : ${n1} + ${n2} (op: ${op})`);

        const waitTime = Math.floor(Math.random() * 10000) + 5000;
        await sleep(waitTime);

        const resultMsg = {
          n1,
          n2,
          op: 'add',
          result: n1 + n2
        };

        channel.sendToQueue(resultQueue, Buffer.from(JSON.stringify(resultMsg)), {
          persistent: true
        });

        console.log(`✅ [worker_add] Résultat envoyé après ${waitTime / 1000}s : ${resultMsg.result}`);
        channel.ack(msg);
      }
    }, {
      noAck: false
    });

  } catch (error) {
    console.error('❌ Erreur worker_add :', error);
  }
}

startWorker();
