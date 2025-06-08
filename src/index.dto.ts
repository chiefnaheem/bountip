import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class ShortenUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://example.com/my-long-url',
  })
  @IsUrl()
  @IsString()
  originalUrl: string;
}
