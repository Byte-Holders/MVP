import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OrchestratorService } from './orchestrator.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app
    .get(OrchestratorService)
    .execute({ owner: 'mmendesas', repository: 'jest-nextjs' });
  await app.close();
}

bootstrap();
