import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://develop.dfk7n70x1c1hn.amplifyapp.com',
    ],
    credentials: true,
  });
  app.setGlobalPrefix('api'); // aggiunge il prefisso 'api' a tutti gli endpoint

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
