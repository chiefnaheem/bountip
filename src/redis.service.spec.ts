import { RedisService } from './redis.service';
import { createClient, RedisClientType } from 'redis';

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

describe('RedisService', () => {
  let svc: RedisService;
  let client: RedisClientType;

  beforeEach(() => {
    client = {
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(JSON.stringify('foo')),
      scanIterator: jest.fn().mockReturnValue(
        (async function* () {
          yield 'key1';
          yield 'key2';
        })(),
      ),
      lPush: jest.fn().mockResolvedValue(2),
      lRange: jest.fn().mockResolvedValue(['a', 'b']),
      flushAll: jest.fn().mockResolvedValue('OK'),
    } as any;

    (createClient as jest.Mock).mockReturnValue(client);

    svc = new RedisService();
  });

  it('should set and get values', async () => {
    await svc.set('k', { a: 1 }, 123);
    expect(client.set).toHaveBeenCalled();
    expect(await svc.get('k')).toBeDefined();
  });

  it('should delete key', async () => {
    expect(await svc.delete('k')).toBe(1);
  });

  it('should scan keys', async () => {
    const keys = await svc.keys('pat*');
    expect(keys).toEqual(['key1', 'key2']);
  });

  it('should push and range lists', async () => {
    expect(await svc.lpush('lk', 'v')).toBe(2);
    expect(await svc.lrange('lk', 0, -1)).toEqual(['a', 'b']);
  });

  it('should flush all keys', async () => {
    expect(await svc.flushAll()).toBe('OK');
  });

  it('should clear by pattern', async () => {
    const deleted = await svc.clearByPattern('*');
    expect(deleted).toBe(1);
  });
});
