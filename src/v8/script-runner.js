import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { config } from "../config.js";

const workerPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "script-worker.js");

export function runV8Script(script, context, timeoutMs = config.v8.timeoutMs) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, {
      workerData: {
        script,
        context: {
          ...context,
          logs: []
        }
      }
    });

    const timer = setTimeout(async () => {
      await worker.terminate();
      reject(new Error(`V8 script exceeded ${timeoutMs}ms timeout`));
    }, timeoutMs);

    worker.once("message", (message) => {
      clearTimeout(timer);
      if (message.ok) {
        resolve(message);
      } else {
        reject(Object.assign(new Error(message.error.message), { stack: message.error.stack }));
      }
    });

    worker.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
