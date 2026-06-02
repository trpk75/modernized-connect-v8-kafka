import { EventEmitter } from "node:events";

export class MemoryBroker {
  constructor() {
    this.events = new EventEmitter();
    this.events.setMaxListeners(100);
  }

  async connect() {}

  async publish(topic, message, key) {
    const event = {
      topic,
      key,
      value: message,
      offset: String(Date.now())
    };
    queueMicrotask(() => this.events.emit(topic, event));
  }

  async subscribe(topic, groupId, handler) {
    this.events.on(topic, handler);
    return async () => this.events.off(topic, handler);
  }

  async disconnect() {
    this.events.removeAllListeners();
  }
}
