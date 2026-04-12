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
} from './interfaces/iscan-status.service';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { UpdateScanStatusFromContainerDto } from './dtos/update-scan-status-from-container.dto';
import { UpdateScanStatusDto } from './dtos/update-scan-status.dto';
import { ScanStatus } from './enums/scan-status.enum';

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
    return await this.scanStatusService.getScanStatus(dto.scanId);
  }

  // TODO guardia che permette solo al container di interagire
  // UpdateScanStatusFromContainerDto ~ UpdateScanStatusDto
  @Put('/')
  @UsePipes(new ValidationPipe())
  async update(
    @Body() updateStatusDto: UpdateScanStatusFromContainerDto,
  ): Promise<void> {
    // brutto ma compila
    const dto: UpdateScanStatusDto =
      updateStatusDto as unknown as UpdateScanStatusDto;

    try {
      return await this.scanStatusService.setScanStatus(dto.scanId, dto.status);
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
