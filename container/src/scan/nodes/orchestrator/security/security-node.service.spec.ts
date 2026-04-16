import { Test, TestingModule } from '@nestjs/testing';
import { SecurityNodeService } from './security-node.service';
import { SecurityNodeHelper } from './security-node.helper';
import { mkdir } from 'fs/promises';

jest.mock('fs/promises');
const mockedMkdir = mkdir as jest.MockedFunction<typeof mkdir>;

describe('SecurityNodeService', () => {
  let service: SecurityNodeService;
  let helper: jest.Mocked<SecurityNodeHelper>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockHelper = {
      buildReportPath: jest.fn(),
      isSemgrepInstalled: jest.fn(),
      executeSemgrep: jest.fn(),
      parseResults: jest.fn(),
      translateDescriptions: jest.fn(),
      getMark: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityNodeService,
        { provide: SecurityNodeHelper, useValue: mockHelper },
      ],
    }).compile();

    service = module.get<SecurityNodeService>(SecurityNodeService);
    helper = module.get(SecurityNodeHelper);
  });

  describe('scan', () => {
    it('should fail and return an empty object if semgrep is not installed', async () => {
      helper.buildReportPath.mockReturnValue('/reports/my-repo/scan_123.json');
      helper.isSemgrepInstalled.mockResolvedValueOnce(false);

      const result = await service.scan({ repoPath: '/workspace/my-repo' });

      expect(mockedMkdir).toHaveBeenCalled();
      expect(result).toEqual({});
      expect(helper.executeSemgrep).not.toHaveBeenCalled();
    });

    it('should fail and return an empty object if executeSemgrep throws an error', async () => {
      helper.buildReportPath.mockReturnValue('/reports/my-repo/scan_123.json');
      helper.isSemgrepInstalled.mockResolvedValueOnce(true);
      helper.executeSemgrep.mockRejectedValueOnce(
        new Error('CLI execution failed'),
      );

      const result = await service.scan({ repoPath: '/workspace/my-repo' });

      expect(result).toEqual({});
      expect(helper.parseResults).not.toHaveBeenCalled();
    });

    it('should fail and return an empty object if parseResults throws an error', async () => {
      helper.buildReportPath.mockReturnValue('/reports/my-repo/scan_123.json');
      helper.isSemgrepInstalled.mockResolvedValueOnce(true);
      helper.executeSemgrep.mockResolvedValueOnce(undefined);
      helper.parseResults.mockRejectedValueOnce(new Error('Invalid JSON'));

      const result = await service.scan({ repoPath: '/workspace/my-repo' });

      expect(result).toEqual({});
      expect(helper.getMark).not.toHaveBeenCalled();
    });

    it('should pass and return a full vulnerabilities report on success', async () => {
      const mockUnits: any[] = [{ id: 'vuln-1', severity: 5 }];
      const mockMark = 8;

      helper.buildReportPath.mockReturnValue('/reports/my-repo/scan_123.json');
      helper.isSemgrepInstalled.mockResolvedValueOnce(true);
      helper.executeSemgrep.mockResolvedValueOnce(undefined);
      helper.parseResults.mockResolvedValueOnce(mockUnits);
      helper.getMark.mockReturnValueOnce(mockMark);

      const result = await service.scan({ repoPath: '/workspace/my-repo' });

      expect(mockedMkdir).toHaveBeenCalledWith('/reports/my-repo', {
        recursive: true,
      });
      expect(result).toEqual({
        vulnerabilitiesReport: {
          vulnerabilities: mockUnits,
          mark: mockMark,
        },
        vulnerabilitiesReportPath: '/reports/my-repo/scan_123.json',
      });
    });
  });
});
