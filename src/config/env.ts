import 'dotenv/config';

type NodeEnvironment = 'development' | 'test' | 'production';

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  return port;
};

const nodeEnv = (process.env.NODE_ENV ?? 'development') as NodeEnvironment;
if (!['development', 'test', 'production'].includes(nodeEnv)) {
  throw new Error('NODE_ENV must be development, test, or production');
}

export const env = {
  port: parsePort(process.env.PORT),
  mongodbUri: required('MONGODB_URI'),
  nodeEnv,
};
