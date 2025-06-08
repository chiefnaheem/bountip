import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ShortenUrlDto } from './index.dto';
import { ClickInfo } from './app.interface';

@ApiTags('URL Shortener')
@Controller('url')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Default Hello endpoint' })
  @ApiResponse({ status: 200, description: 'Returns Hello World' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('shorten')
  @ApiOperation({ summary: 'Shorten a given URL' })
  @ApiResponse({
    status: 201,
    description: 'Returns the shortened code',
    schema: {
      example: { shortCode: 'A1B2C3D' },
    },
  })
  async shorten(@Body() body: ShortenUrlDto): Promise<{ shortCode: string }> {
    const shortCode = await this.appService.shorten(body.originalUrl);
    return { shortCode };
  }

  @Get(':shortCode')
  @ApiOperation({ summary: 'Get original URL from short code' })
  @ApiResponse({
    status: 200,
    description: 'Returns the original URL',
    schema: {
      example: { originalUrl: 'https://example.com/my-long-url' },
    },
  })
  async getOriginalUrl(
    @Param('shortCode') shortCode: string,
  ): Promise<{ originalUrl: string | null }> {
    const originalUrl = await this.appService.getOriginalUrl(shortCode);
    return { originalUrl };
  }

  @Post(':shortCode/click')
  @ApiOperation({ summary: 'Record a click on a short URL' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Click recorded successfully',
  })
  async recordClick(
    @Param('shortCode') shortCode: string,
    @Req() req: Request,
  ): Promise<void> {
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req?.socket.remoteAddress ||
      '';

    const userAgent = req.headers['user-agent'] || 'unknown';

    await this.appService.recordClick(shortCode, ip, userAgent);
  }
  @Get(':shortCode/analytics')
  @ApiOperation({ summary: 'Get analytics for a short URL' })
  @ApiResponse({
    status: 200,
    description: 'List of click analytics',
    // type: [ClickInfo],
    schema: {
      example: [
        {
          timestamp: '2025-06-05T12:34:56Z',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ],
    },
  })
  async getAnalytics(
    @Param('shortCode') shortCode: string,
  ): Promise<ClickInfo[]> {
    return this.appService.getAnalytics(shortCode);
  }
}
