import { Module } from '@nestjs/common';
import { ScanModule } from './scan.module';

@Module({
  imports: [ScanModule],
})
export class AppModule {}
