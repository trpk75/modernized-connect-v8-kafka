import vm from "node:vm";
import { parentPort, workerData } from "node:worker_threads";

const { script, context } = workerData;

try {
  const sandbox = {
    ...context,
    result: undefined,
    console: {
      log: (...args) => context.logs.push(args.join(" "))
    }
  };
  vm.createContext(sandbox);
  const source = `
    result = (function runMigratedScript() {
      ${script}
    })();
  `;
  new vm.Script(source).runInContext(sandbox);
  parentPort.postMessage({
    ok: true,
    result: sandbox.result,
    maps: {
      channelMap: sandbox.channelMap,
      sourceMap: sandbox.sourceMap,
      connectorMap: sandbox.connectorMap
    },
    logs: sandbox.logs
  });
} catch (error) {
  parentPort.postMessage({
    ok: false,
    error: {
      message: error.message,
      stack: error.stack
    }
  });
}
