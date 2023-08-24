if (!process.env.IS_TS_NODE) {
  require('module-alias/register');
}

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');
  await app.listen(PORT);
}
bootstrap();
