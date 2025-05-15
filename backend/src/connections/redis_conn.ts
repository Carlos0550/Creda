import Redis from "ioredis";


// const redis = new Redis({
//   host: "localhost",
//   port: 6379,
// });

const redis = process.env.NODE_ENV === "production"
? new Redis(process.env.REDIS_PUBLIC_URL || "")
: new Redis({
  host: "localhost",
  port: 6379
}); 

redis.on('connect', () => {
  console.log('🔌 Conectado a Redis');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis error:', err);
});

export default redis