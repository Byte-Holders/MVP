import { Module } from '@nestjs/common';
import { ISCAN_STATUS_SERVICE_TOKEN } from './scan-status/interfaces/iscan-status.service';
import { ISCAN_REPOSITORY_TOKEN } from './interfaces/iscan.repository';

import { ScanStatusService } from './scan-status/scan-status.service';
import { ScanStatusController } from './scan-status/scan-status.controller';

import { ScanRepository } from './scan.repository';
import { ScanSchema, ScanSchemaClass } from './schemas/scan.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ISCAN_MANAGER_SERVICE_TOKEN } from './scan-manager/interfaces/iscan-manager.service';
import { ScanManagerService } from './scan-manager/scan-manager.service';
import { ScanManagerController } from './scan-manager/scan-manager.controller';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { RepositoryModule } from '../repository/repository.module';
import { ScanAuthGuard } from './scan-auth/scan-auth.guard';

@Module({
  imports: [
    RepositoryModule,
    MongooseModule.forFeature([
      { name: ScanSchemaClass.name, schema: ScanSchema },
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
  ],
  controllers: [ScanStatusController, ScanManagerController],
  providers: [
    {
      provide: ISCAN_STATUS_SERVICE_TOKEN,
      useClass: ScanStatusService,
    },
    {
      provide: ISCAN_REPOSITORY_TOKEN,
      useClass: ScanRepository,
    },
    {
      provide: ISCAN_MANAGER_SERVICE_TOKEN,
      useClass: ScanManagerService,
    },
    ScanAuthGuard,
  ],
  exports: [ISCAN_STATUS_SERVICE_TOKEN],
})
export class ScanModule {}
