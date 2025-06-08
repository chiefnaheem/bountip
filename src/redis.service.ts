import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import serverConfig from './config/env.config';

@Injectable()
export class RedisService {
  private readonly client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    const { host, port, username, password } = serverConfig.redis;
    console.log(host, port, username, password, 'loggggg');
    const auth = username && password ? `${username}:${password}@` : '';
    this.client = createClient({ url: `redis://${auth}${host}:${port}` });

    this.client.on('error', (err) =>
      this.logger.error('RedisClient Error', err),
    );

    this.client
      .connect()
      .catch((err) => this.logger.error('Redis connection failed', err));
  }

  async set(key: string, value: any, ttl = 600): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttl });
    } catch (error) {
      this.logger.error(`Failed to set key: ${key}`, error);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const val = await this.client.get(key);
      return typeof val === 'string' ? (JSON.parse(val) as T) : null;
    } catch (error) {
      this.logger.error(`Failed to get key: ${key}`, error);
      return null;
    }
  }

  async delete(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key: ${key}`, error);
      return 0;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    const results: string[] = [];
    try {
      for await (const key of this.client.scanIterator({ MATCH: pattern })) {
        results.push(key as unknown as string);
      }
    } catch (error) {
      this.logger.error(`Failed to scan keys with pattern: ${pattern}`, error);
    }
    return results;
  }

  async lpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.lPush(key, value);
    } catch (error) {
      this.logger.error(`Failed to LPUSH key: ${key}`, error);
      return 0;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to LRANGE key: ${key}`, error);
      return [];
    }
  }

  async flushAll(): Promise<string> {
    try {
      return await this.client.flushAll();
    } catch (error) {
      this.logger.error('Failed to flush all Redis keys', error);
      return 'Failed';
    }
  }

  async clearByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.client.del(keys);
    } catch (error) {
      this.logger.error(`Failed to clear keys by pattern: ${pattern}`, error);
      return 0;
    }
  }
}
