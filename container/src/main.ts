import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ScanService } from './scan/scan.service';
import { ScanModule } from './scan/scan.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app
    .select(ScanModule)
    .get(ScanService, { strict: true })
    // .execute({ owner: 'OWASP', repository: 'NodeGoat' });
    // .execute({ owner: 'mmendesas', repository: 'jest-nextjs' });
    .scan();
  await app.close();
}

bootstrap();
