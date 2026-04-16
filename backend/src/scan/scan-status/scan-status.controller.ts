import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Param,
  Patch,
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
  ISCAN_STATUS_SERVICE_TOKEN,
  type IScanStatusService,
} from './interfaces/iscan-status.service';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { SetErrorStatusDto } from './dtos/set-error-status.dto';
import { ScanStatus } from './enums/scan-status.enum';
import { ScanAuthGuard } from '../scan-auth/scan-auth.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('scan')
@Controller('/scan/:scanId/status')
export class ScanStatusController {
  constructor(
    @Inject(ISCAN_STATUS_SERVICE_TOKEN)
    private readonly scanStatusService: IScanStatusService,
  ) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Ottieni lo stato di una scansione' })
  @ApiParam({ name: 'scanId', description: 'ID della scansione' })
  @ApiResponse({ status: 200, description: 'Stato corrente della scansione', schema: { enum: Object.values(ScanStatus) } })
  @ApiResponse({ status: 404, description: 'Scansione non trovata' })
  @Get('/')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async getScanStatus(@Param() dto: GetScanStatusDto): Promise<ScanStatus> {
    return await this.scanStatusService.getScanStatus(dto.scanId);
  }

  @ApiOperation({ summary: 'Imposta lo stato di errore (chiamato dal container)' })
  @ApiParam({ name: 'scanId', description: 'ID della scansione' })
  @ApiResponse({ status: 204, description: 'Stato aggiornato' })
  @ApiResponse({ status: 401, description: 'Token non valido' })
  @Patch('/')
  @HttpCode(HttpStatus.NO_CONTENT)
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
