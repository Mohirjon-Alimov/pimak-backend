import { createClient } from "redis";
import dotenv from 'dotenv'
dotenv.config()

export const Client = async () => {
  try {
    const redis = createClient({
      url: process.env.REDIS_URL,
    });

    redis.on("error", (err) => console.log(err));

    await redis.connect();
    return redis
  } catch (err: unknown) {
    console.log(err);
  }
};
