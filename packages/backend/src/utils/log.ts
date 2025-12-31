export const log = {
  info: (msg: string) => console.log(`ℹ️ ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  debug: (msg: string) => console.log(msg),
  error: (msg: string, err?: unknown) => console.error(`❌ ${msg}`, err),
};
