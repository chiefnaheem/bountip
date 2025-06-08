import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { RedisService } from './redis.service';
import { ClickInfo } from './app.interface';

@Injectable()
export class AppService {
  private readonly urlPrefix = 'url:';
  private readonly analyticsPrefix = 'analytics:';
  private readonly generateCode = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    7,
  );

  constructor(private readonly redisService: RedisService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async shorten(originalUrl: string): Promise<string> {
    const shortCode = this.generateCode();
    const key = this.urlPrefix + shortCode;
    const ttlSeconds = 30 * 24 * 60 * 60;

    await this.redisService.set(key, originalUrl, ttlSeconds);
    return shortCode;
  }

  async getOriginalUrl(shortCode: string): Promise<string | null> {
    return this.redisService.get<string>(this.urlPrefix + shortCode);
  }

  async recordClick(
    shortCode: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    const click: ClickInfo = { timestamp: new Date(), ip, userAgent };
    const key = this.analyticsPrefix + shortCode;
    await this.redisService.lpush(key, JSON.stringify(click));
  }

  async getAnalytics(shortCode: string): Promise<ClickInfo[]> {
    const key = this.analyticsPrefix + shortCode;
    const items = await this.redisService.lrange(key, 0, -1);
    return items.map((item) => {
      const p = JSON.parse(item);
      return { ...p, timestamp: new Date(p.timestamp) };
    });
  }
}
