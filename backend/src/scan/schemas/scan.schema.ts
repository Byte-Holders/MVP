import { Prop, Schema } from '@nestjs/mongoose';
import { ScanTarget } from '../types/scan-target.type';
import { scanStatus, type ScanStatus } from '../types/scan-status.type';

@Schema()
export class Scan {
  @Prop({ required: true, type: ScanTarget })
  target: ScanTarget;

  @Prop({ required: false })
  callbackToken?: string;

  @Prop({ required: true, type: Date })
  startTime: Date;

  @Prop({ required: false, type: Date })
  endTime?: Date;

  @Prop({ required: true, type: scanStatus })
  status: ScanStatus;
}
