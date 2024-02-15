import redis from "express-redis-cache";

export const redisCache = redis({
  port: process.env.REDIS_PORT,
  host: "localhost",
  prefix: "cache",
  expire: 60 * 60,
});
