import { Body, Controller, Inject, Patch, Post } from '@nestjs/common';
import {
  ISCAN_MANAGER_SERVICE_TOKEN,
  type IScanManagerService,
} from './interfaces/iscan-manager.service';
import { StartScanDto } from './dtos/start-scan.dto';
import { StopScanDto } from './dtos/stop-scan.dto';

// TODO tutte le guardie
@Controller('/scan')
export class ScanManagerController {
  constructor(
    @Inject(ISCAN_MANAGER_SERVICE_TOKEN)
    private readonly scanManagerService: IScanManagerService,
  ) {}

  @Post()
  async startScan(@Body() startScanDto: StartScanDto) {
    await this.scanManagerService.startScan(startScanDto);
  }

  @Patch()
  async stopScan(@Body() stopScanDto: StopScanDto) {
    await this.scanManagerService.stopScan(stopScanDto);
  }
}
