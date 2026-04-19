// @excalidraw/excalidraw (webpack UMD build) expects Node's `process` at runtime in the browser.
const g = globalThis as typeof globalThis & { process?: { env: Record<string, string> } };
if (typeof g.process === 'undefined') {
  g.process = {
    env: {
      NODE_ENV: import.meta.env.PROD ? 'production' : 'development',
      IS_PREACT: 'false',
    },
  };
}
