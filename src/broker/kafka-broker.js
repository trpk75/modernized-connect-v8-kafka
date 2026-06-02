import { Kafka } from "kafkajs";

export class KafkaBroker {
  constructor(config) {
    this.kafka = new Kafka(config);
    this.producer = this.kafka.producer();
    this.consumers = [];
  }

  async connect() {
    await this.producer.connect();
  }

  async publish(topic, message, key) {
    await this.producer.send({
      topic,
      messages: [{
        key,
        value: JSON.stringify(message),
        headers: {
          correlationId: message.correlationId || key || ""
        }
      }]
    });
  }

  async subscribe(topic, groupId, handler) {
    const consumer = this.kafka.consumer({ groupId });
    this.consumers.push(consumer);
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ topic: eventTopic, partition, message }) => {
        await handler({
          topic: eventTopic,
          partition,
          key: message.key?.toString(),
          value: JSON.parse(message.value.toString()),
          offset: message.offset
        });
      }
    });

    return async () => consumer.disconnect();
  }

  async disconnect() {
    await Promise.all(this.consumers.map((consumer) => consumer.disconnect()));
    await this.producer.disconnect();
  }
}
