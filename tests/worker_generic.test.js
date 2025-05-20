// tests/worker_generic.test.js
const amqp = require('amqplib');

const RABBIT_URL = 'amqp://user:password@localhost';
const RESULT_QUEUE = 'results';

const operations = [
  { op: 'add', n1: 6, n2: 4, expected: 10 },
  { op: 'sub', n1: 10, n2: 3, expected: 7 },
  { op: 'mul', n1: 5, n2: 5, expected: 25 },
  { op: 'div', n1: 20, n2: 4, expected: 5 }
];

describe('RabbitMQ distributed workers (add/sub/mul/div)', () => {
  let connection, channel;

  beforeAll(async () => {
    connection = await amqp.connect(RABBIT_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(RESULT_QUEUE, { durable: true });
  });

  afterAll(async () => {
    await channel.close();
    await connection.close();
  });

  operations.forEach(({ op, n1, n2, expected }) => {
    test(`Worker '${op}' should return correct result (${n1} ${op} ${n2} = ${expected})`, async () => {
      const inputQueue = `rpc_${op}`;
      const message = { n1, n2, op };

      await channel.assertQueue(inputQueue, { durable: true });
      channel.sendToQueue(inputQueue, Buffer.from(JSON.stringify(message)), {
        persistent: true
      });

      const result = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(`❌ Timeout for op ${op}`), 20000);

        channel.consume(RESULT_QUEUE, (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            const isMatch = content.n1 === n1 && content.n2 === n2 && content.op === op;

            if (isMatch) {
              channel.ack(msg);
              clearTimeout(timeout);
              resolve(content);
            } else {
              channel.nack(msg, false, true); // Remet dans la queue
            }
          }
        }, { noAck: false });
      });

      expect(result.result).toBe(expected);
    });
  });
});
