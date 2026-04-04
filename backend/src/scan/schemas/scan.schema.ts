import { Prop, Schema } from '@nestjs/mongoose';
import { type ScanTarget } from '../types/scan-target.type';
import { type ScanStatus } from '../types/scan-status.type';

@Schema()
export class Scan {
  @Prop({ required: true })
  target: ScanTarget;

  @Prop({ required: false })
  callbackToken: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: false })
  endTime?: Date;

  @Prop({ required: true })
  status: ScanStatus;
}
