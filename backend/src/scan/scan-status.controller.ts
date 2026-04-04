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
import { type GetScanStatusDto } from './dtos/get-scan-status.dto';
import type { SetScanStatusDto } from './dtos/set-scan-status.dto';

@Controller('/scan/status')
export class ScanStatusController {
  constructor(
    @Inject(ISCAN_STATUS_SERVICE_TOKEN)
    private readonly scanStatusService: IScanStatusService,
  ) {}

  @Get('/:owner/:name/:branch')
  getScanStatus(
    @Param('owner') owner: string,
    @Param('name') name: string,
    @Param('branch') branch: string,
  ): GetScanStatusDto {
    const dto: GetScanStatusDto = {
      repository: {
        name,
        owner,
      },
      branch,
    };
    return this.scanStatusService.getScanStatus(dto);
  }

  @Put('/')
  @UsePipes(new ValidationPipe())
  setScanStatus(@Body() setScanStatusDto: SetScanStatusDto): void {
    try {
      return this.scanStatusService.setScanStatus(setScanStatusDto);
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
