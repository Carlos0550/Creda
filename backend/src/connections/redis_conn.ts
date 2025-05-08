import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_PUBLIC_URL || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on('connect', () => {
  console.log('🔌 Conectado a Redis');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis error:', err);
});

export default redis