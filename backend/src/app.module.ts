import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkspaceModule } from './workspace/workspace.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { RepositoryModule } from './repository/repository.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get<string>('DB_USER')}:${configService.get<string>('DB_PASSWORD')}@${configService.get<string>('DB_IP')}:${configService.get<string>('DB_PORT')}/${configService.get<string>('DB_NAME')}?authSource=admin`,
      }),
    }),
    WorkspaceModule,
    UserModule,
    RepositoryModule,
    AuthModule 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
