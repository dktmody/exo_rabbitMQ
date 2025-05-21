const EXCHANGE = "operations";

export function getRoutingKey(op) {
  return op === "all" ? `${EXCHANGE}.all` : `${EXCHANGE}.${op}`;
}

export function publishMessage(channel, msg, routingKey) {
  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(msg)), {
    persistent: true,
    correlationId: msg.id,
  });
}
