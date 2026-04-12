import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSchemaClass, ReportSchema } from './schemas/report.schema';
import { ReportRepository } from './repositories/report.repository';
import { ReportService } from './services/report.service';
import { ReportController } from './controllers/report.controller';
import { ReportRepositoryToken } from './interfaces/ireport.repository.interface';
import { ReportServiceToken } from './interfaces/ireport.service.interface';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReportSchemaClass.name, schema: ReportSchema },
    ]),
    RepositoryModule,
  ],
  controllers: [ReportController],
  providers: [
    {
      provide: ReportRepositoryToken,
      useClass: ReportRepository,
    },
    {
      provide: ReportServiceToken,
      useClass: ReportService,
    },
  ],
})
export class ReportModule {}
