import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ScanStatusController } from './scan-status.controller';
import {
  ISCAN_STATUS_SERVICE_TOKEN,
  IScanStatusService,
} from './interfaces/iscan-status.service';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { SetErrorStatusDto } from './dtos/set-error-status.dto';
import { ScanStatus } from './enums/scan-status.enum';
import { ScanAuthGuard } from '../scan-auth/scan-auth.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

const MOCK_SCAN_ID = 'myId';
const MOCK_CONTAINER_TOKEN = 'myToken';

const mockGetScanStatusDto: GetScanStatusDto = {
  scanId: MOCK_SCAN_ID,
};

const mockSetErrorStatusDto: SetErrorStatusDto = {
  token: MOCK_CONTAINER_TOKEN,
};

describe('ScanStatusController', () => {
  let controller: ScanStatusController;
  let mockService: jest.Mocked<IScanStatusService>;

  beforeEach(async () => {
    mockService = {
      getScanStatus: jest.fn(),
      setScanStatus: jest.fn(),
      setScanStatusFromToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanStatusController],
      providers: [
        { provide: ISCAN_STATUS_SERVICE_TOKEN, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ScanAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ScanStatusController>(ScanStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getScanStatus', () => {
    it('returns each ScanStatus value', async () => {
      for (const status of Object.values(ScanStatus)) {
        mockService.getScanStatus.mockResolvedValue(status);
        const result = await controller.getScanStatus(mockGetScanStatusDto);
        expect(result).toBe(status);
      }
    });

    it('rejects when the service rejects', async () => {
      mockService.getScanStatus.mockRejectedValue(
        new Error('Error getting scan status'),
      );

      await expect(
        controller.getScanStatus(mockGetScanStatusDto),
      ).rejects.toThrow();
    });
  });

  describe('setErrorStatus', () => {
    it('calls the service on setScanStatusFromToken with the passed scanId and error status', async () => {
      await controller.setErrorStatus(mockSetErrorStatusDto);
      expect(mockService.setScanStatusFromToken).toHaveBeenCalledWith(
        mockSetErrorStatusDto.token,
        ScanStatus.Err,
      );
    });

    it('throws InternalServerErrorException when the service throws', async () => {
      mockService.setScanStatusFromToken.mockRejectedValue(new Error());

      await expect(
        controller.setErrorStatus(mockSetErrorStatusDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('returns void on success', async () => {
      //Per controllare che effettivamente in caso di successo dell'update nulla venga ritornato
      mockService.setScanStatusFromToken.mockResolvedValue(undefined);
      await expect(
        controller.setErrorStatus(mockSetErrorStatusDto),
      ).resolves.toBeUndefined();
    });
  });
});
