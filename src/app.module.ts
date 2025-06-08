import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RedisService } from './redis.service';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 5000,
          limit: 10,
        },
        {
          name: 'medium',
          ttl: 20000,
          limit: 25,
        },
        {
          name: 'long',
          ttl: 35000,
          limit: 50,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
