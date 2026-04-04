import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ISCAN_STATUS_SERVICE_TOKEN,
  type IScanStatusService,
} from './interfaces/iscan-status-service';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { UpdateScanStatusFromContainerDto } from './dtos/update-scan-status-from-container.dto';
import { ScanStatus } from './types/scan-status.type';
import { UpdateScanStatusDto } from './dtos/update-scan-status.dto';

@Controller('/scan/status')
export class ScanStatusController {
  constructor(
    @Inject(ISCAN_STATUS_SERVICE_TOKEN)
    private readonly scanStatusService: IScanStatusService,
  ) {}

  @Get('/repositories/:repositoryId/branches/:branch')
  @UsePipes(new ValidationPipe())
  async getScanStatus(@Param() dto: GetScanStatusDto): Promise<ScanStatus> {
    console.log('Called');
    return await this.scanStatusService.getScanStatus(dto);
  }

  // TODO guardia container
  @Put('/')
  @UsePipes(new ValidationPipe())
  async update(
    @Body() updateStatusDto: UpdateScanStatusFromContainerDto,
  ): Promise<void> {
    const dto: UpdateScanStatusDto = updateStatusDto;

    try {
      return await this.scanStatusService.setScanStatus(dto);
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
