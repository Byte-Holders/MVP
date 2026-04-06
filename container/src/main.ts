import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.select(AppModule).get(AppService, { strict: true }).run();

  await app.close();
}

bootstrap();
