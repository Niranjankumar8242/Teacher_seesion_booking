import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

const start = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.info(`API listening on port ${env.port}`);
  });

  const shutdown = (signal: string): void => {
    console.info(`${signal} received; shutting down`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch((error: unknown) => {
  console.error('Failed to start the application', error);
  process.exit(1);
});
