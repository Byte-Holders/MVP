import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScanModule } from './scan.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/'),
    ScanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
