import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ScanService } from './scan/scan.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app
    .get(ScanService)
    // .execute({ owner: 'OWASP', repository: 'NodeGoat' });
    // .execute({ owner: 'mmendesas', repository: 'jest-nextjs' });
    .scan();
  await app.close();
}

bootstrap();
