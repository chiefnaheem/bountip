import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Request } from 'express';

describe('AppController', () => {
  let controller: AppController;
  let appService: Partial<Record<keyof AppService, jest.Mock>>;

  beforeEach(async () => {
    appService = {
      getHello: jest.fn().mockReturnValue('Hello World!'),
      shorten: jest.fn().mockResolvedValue('A1B2C3D'),
      getOriginalUrl: jest
        .fn()
        .mockResolvedValue('https://example.com/my-long-url'),
      recordClick: jest.fn().mockResolvedValue(undefined),
      getAnalytics: jest.fn().mockResolvedValue([
        {
          timestamp: new Date('2025-06-05T12:34:56Z'),
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(controller.getHello()).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe('shorten', () => {
    it('should call appService.shorten and return shortCode', async () => {
      const dto = { originalUrl: 'https://test.com' };
      const result = await controller.shorten(dto);
      expect(appService.shorten).toHaveBeenCalledWith(dto.originalUrl);
      expect(result).toEqual({ shortCode: 'A1B2C3D' });
    });
  });

  describe('getOriginalUrl', () => {
    it('should return originalUrl for given shortCode', async () => {
      const shortCode = 'A1B2C3D';
      const result = await controller.getOriginalUrl(shortCode);
      expect(appService.getOriginalUrl).toHaveBeenCalledWith(shortCode);
      expect(result).toEqual({
        originalUrl: 'https://example.com/my-long-url',
      });
    });
  });

  describe('recordClick', () => {
    it('should extract IP from x-forwarded-for and user-agent from headers and call recordClick', async () => {
      const shortCode = 'A1B2C3D';
      const req = {
        headers: {
          'x-forwarded-for': '1.2.3.4, 5.6.7.8',
          'user-agent': 'jest-agent',
        },
        socket: {
          remoteAddress: '9.10.11.12',
        },
      } as unknown as Request;

      await controller.recordClick(shortCode, req);
      expect(appService.recordClick).toHaveBeenCalledWith(
        shortCode,
        '1.2.3.4',
        'jest-agent',
      );
    });

    it('should fallback to socket.remoteAddress if x-forwarded-for missing', async () => {
      const shortCode = 'A1B2C3D';
      const req = {
        headers: {
          'user-agent': 'jest-agent',
        },
        socket: {
          remoteAddress: '9.10.11.12',
        },
      } as unknown as Request;

      await controller.recordClick(shortCode, req);
      expect(appService.recordClick).toHaveBeenCalledWith(
        shortCode,
        '9.10.11.12',
        'jest-agent',
      );
    });

    it('should fallback to empty string for IP and "unknown" for user-agent if missing', async () => {
      const shortCode = 'A1B2C3D';
      const req = {
        headers: {},
        socket: {
          remoteAddress: undefined,
        },
      } as unknown as Request;

      await controller.recordClick(shortCode, req);
      expect(appService.recordClick).toHaveBeenCalledWith(
        shortCode,
        '',
        'unknown',
      );
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      const shortCode = 'A1B2C3D';
      const result = await controller.getAnalytics(shortCode);
      expect(appService.getAnalytics).toHaveBeenCalledWith(shortCode);
      expect(result).toEqual([
        {
          timestamp: new Date('2025-06-05T12:34:56Z'),
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ]);
    });
  });
});
