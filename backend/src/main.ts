import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
  app.setGlobalPrefix('api') // aggiunge il prefisso 'api' a tutti gli endpoint
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
