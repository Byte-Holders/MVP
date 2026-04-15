import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ReportSchemaClass, ReportSchema } from './schemas/report.schema';
import { ReportRepository } from './repositories/report.repository';
import { ReportService } from './services/report.service';
import { ReportController } from './controllers/report.controller';
import { ReportRepositoryToken } from './interfaces/ireport.repository.interface';
import { ReportServiceToken } from './interfaces/ireport.service.interface';
import { RepositoryModule } from '../repository/repository.module';
import { WorkspaceUserModule } from '../workspace/workspaceUser/workspaceUser.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReportSchemaClass.name, schema: ReportSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn:
            Number(configService.get('JWT_EXPIRATION_TIME_IN_SECONDS')) || 3600,
        },
      }),
      inject: [ConfigService],
    }),
    RepositoryModule,
    WorkspaceUserModule,
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
