import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { RedisService } from './redis.service';
import { ClickInfo } from './app.interface';

describe('AppService', () => {
  let service: AppService;
  let redis: RedisService;

  beforeEach(async () => {
    const redisMock = {
      set: jest.fn(),
      get: jest.fn(),
      lpush: jest.fn(),
      lrange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, { provide: RedisService, useValue: redisMock }],
    }).compile();

    service = module.get(AppService);
    redis = module.get(RedisService);
  });

  it('should return greeting', () => {
    expect(service.getHello()).toBe('Hello World!');
  });

  it('should shorten URL and save in redis', async () => {
    (redis.set as jest.Mock).mockResolvedValue(undefined);
    const code = await service.shorten('https://example.com');
    expect(code).toHaveLength(7);
    expect(redis.set).toHaveBeenCalledWith(
      expect.any(String),
      'https://example.com',
      expect.any(Number),
    );
  });

  it('should get original URL', async () => {
    (redis.get as jest.Mock).mockResolvedValue('https://test.com');
    expect(await service.getOriginalUrl('ABC1234')).toBe('https://test.com');
  });

  it('should record a click', async () => {
    (redis.lpush as jest.Mock).mockResolvedValue(1);
    await service.recordClick('ABC1234', '127.0.0.1', 'ua-test');
    expect(redis.lpush).toHaveBeenCalledWith(
      expect.stringContaining('analytics:'),
      expect.any(String),
    );
  });

  it('should transform analytics', async () => {
    const click: ClickInfo = {
      timestamp: new Date(),
      ip: '1.1.1.1',
      userAgent: 'ua',
    };
    (redis.lrange as jest.Mock).mockResolvedValue([JSON.stringify(click)]);
    const result = await service.getAnalytics('ABC1234');
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('ip', '1.1.1.1');
    expect(result[0]).toHaveProperty('userAgent', 'ua');
  });
});
