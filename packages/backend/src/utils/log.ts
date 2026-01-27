export const log = {
  info: (msg: string) => console.log(`ℹ️ ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  debug: (msg: string) => console.log(msg),
  error: (msg: string, err?: unknown) => {
    console.error(`❌ ${msg}`);

    if (err instanceof Error) {
      console.error(err.message);
      console.error(err.stack);
    } else {
      console.error(JSON.stringify(err, null, 2));
    }
  },
};
