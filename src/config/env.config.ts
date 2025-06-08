import { config } from 'dotenv';
import * as env from 'env-var';

config();

const PORT = env.get('PORT').asInt();
const NODE_ENV = env.get('NODE_ENV').asString();

const serverConfig = {
  NODE_ENV,
  PORT,
  redis: {
    ttl: env.get('REDIS_TTL').asInt(),
    username: env.get('REDIS_USERNAME').asString(),
    password: env.get('REDIS_PASSWORD').asString(),
    host: env.get('REDIS_HOST').asString(),
    port: env.get('REDIS_PORT').asInt(),
  },
};

export default serverConfig;
