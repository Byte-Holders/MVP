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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ISCAN_MANAGER_SERVICE_TOKEN,
  type IScanManagerService,
} from './interfaces/iscan-manager.service';
import { StartScanDto } from './dtos/start-scan.dto';
import { StopScanDto } from './dtos/stop-scan.dto';
import { StartScanResponseDto } from './dtos/start-scan-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('ScanManager')
@ApiBearerAuth('access-token')
@Controller('/scan')
export class ScanManagerController {
  constructor(
    @Inject(ISCAN_MANAGER_SERVICE_TOKEN)
    private readonly scanManagerService: IScanManagerService,
  ) {}

  @ApiOperation({ summary: 'Avvia una nuova scansione' })
  @ApiResponse({
    status: 201,
    description: 'Scansione avviata',
    type: StartScanResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  @ApiResponse({ status: 404, description: 'Repository non trovato' })
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

  @ApiOperation({ summary: 'Interrompi una scansione in corso' })
  @ApiParam({ name: 'scanId', description: 'ID della scansione' })
  @ApiResponse({ status: 204, description: 'Scansione interrotta' })
  @ApiResponse({ status: 404, description: 'Scansione non trovata' })
  @Patch('/:scanId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async stopScan(@Param() stopScanDto: StopScanDto): Promise<void> {
    await this.scanManagerService.stopScan(stopScanDto.scanId);
  }
}
