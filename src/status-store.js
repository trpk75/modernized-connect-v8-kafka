import fs from "node:fs/promises";
import path from "node:path";

const statusFile = path.resolve("data", "message-status.json");

export class StatusStore {
  constructor() {
    this.cache = new Map();
  }

  async init() {
    await fs.mkdir(path.dirname(statusFile), { recursive: true });
    try {
      const data = JSON.parse(await fs.readFile(statusFile, "utf8"));
      this.cache = new Map(Object.entries(data));
    } catch {
      this.cache = new Map();
    }
  }

  async upsert(correlationId, patch) {
    const current = this.cache.get(correlationId) || {};
    const next = {
      ...current,
      ...patch,
      correlationId,
      updatedAt: new Date().toISOString()
    };
    this.cache.set(correlationId, next);
    await this.flush();
    return next;
  }

  get(correlationId) {
    return this.cache.get(correlationId);
  }

  async flush() {
    const object = Object.fromEntries(this.cache.entries());
    await fs.writeFile(statusFile, JSON.stringify(object, null, 2));
  }
}

export const statusStore = new StatusStore();
