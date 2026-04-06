import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OrchestratorService } from './scan/nodes/orchestrator/orchestrator.service';
import dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app
    .get(OrchestratorService)
    .execute({ owner: 'OWASP', repository: 'NodeGoat' });
  // .execute({ owner: 'mmendesas', repository: 'jest-nextjs' });
  await app.close();
}

bootstrap();
