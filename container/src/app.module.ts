import { Module } from '@nestjs/common';
import { ScanModule } from './scan/scan.module';
import { ReporterModule } from './reporter/reporter.module';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';

@Module({
  providers: [AppService],
  imports: [ScanModule, ReporterModule, ConfigModule],
})
export class AppModule {}
