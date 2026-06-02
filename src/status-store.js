import fs from "node:fs/promises";
import path from "node:path";

const statusFile = path.resolve("data", "message-status.json");

export class StatusStore {
  constructor() {
    this.cache = new Map();
  }

  async init() {
    await fs.mkdir(path.dirname(statusFile), { recursive: true });
    await this.loadFromDisk();
  }

  async loadFromDisk() {
    try {
      const data = JSON.parse(await fs.readFile(statusFile, "utf8"));
      this.cache = new Map(Object.entries(data));
    } catch {
      this.cache = new Map();
    }
  }

  async upsert(correlationId, patch) {
    await this.loadFromDisk();
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

  async get(correlationId) {
    await this.loadFromDisk();
    return this.cache.get(correlationId);
  }

  async list(limit = 25) {
    await this.loadFromDisk();
    return Array.from(this.cache.values())
      .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))
      .slice(0, limit);
  }

  async flush() {
    const object = Object.fromEntries(this.cache.entries());
    await fs.writeFile(statusFile, JSON.stringify(object, null, 2));
  }
}

export const statusStore = new StatusStore();
