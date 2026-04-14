import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ISCAN_STATUS_SERVICE_TOKEN,
  type IScanStatusService,
} from './interfaces/iscan-status.service';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { SetErrorStatusDto } from './dtos/set-error-status.dto';
import { ScanStatus } from './enums/scan-status.enum';
import { ScanAuthGuard } from '../scan-auth/scan-auth.guard';

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

  @Put('/')
  @UseGuards(ScanAuthGuard)
  @UsePipes(new ValidationPipe())
  async setErrorStatus(@Body() dto: SetErrorStatusDto): Promise<void> {
    try {
      return await this.scanStatusService.setScanStatusFromToken(
        dto.token,
        ScanStatus.Err,
      );
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
