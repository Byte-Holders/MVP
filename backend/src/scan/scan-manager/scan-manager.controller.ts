import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ISCAN_MANAGER_SERVICE_TOKEN,
  type IScanManagerService,
} from './interfaces/iscan-manager.service';
import { StartScanDto } from './dtos/start-scan.dto';
import { StopScanDto } from './dtos/stop-scan.dto';
import { StartScanResponseDto } from './dtos/start-scan-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('/scan')
export class ScanManagerController {
  constructor(
    @Inject(ISCAN_MANAGER_SERVICE_TOKEN)
    private readonly scanManagerService: IScanManagerService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async startScan(
    @Body() startScanDto: StartScanDto,
  ): Promise<StartScanResponseDto> {
    const scan = await this.scanManagerService.startScan(startScanDto);
    return { scanId: scan.id };
  }

  @Patch('/:scanId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async stopScan(@Param() stopScanDto: StopScanDto): Promise<void> {
    await this.scanManagerService.stopScan(stopScanDto.scanId);
  }
}
