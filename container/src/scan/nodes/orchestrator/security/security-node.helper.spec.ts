import { Test, TestingModule } from '@nestjs/testing';
import { SecurityNodeHelper } from './security-node.helper';
import { readFile } from 'fs/promises';
import { executeCli } from '../../../exec.cli';
import { promisify } from 'util';

jest.mock('fs/promises');
const mockedReadFile = readFile as jest.MockedFunction<typeof readFile>;

jest.mock('../../../exec.cli');
const mockedExecuteCli = executeCli as jest.MockedFunction<typeof executeCli>;

jest.mock('util', () => {
  const originalModule = jest.requireActual('util');
  return {
    ...originalModule,
    promisify: jest.fn(),
  };
});

describe('SecurityNodeHelper', () => {
  let helper: SecurityNodeHelper;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityNodeHelper],
    }).compile();

    helper = module.get<SecurityNodeHelper>(SecurityNodeHelper);
  });

  describe('buildReportPath', () => {
    it('should generate a valid report path containing the repo name', () => {
      const repoName = 'my-repo';
      const path = helper.buildReportPath(repoName);
      expect(path).toContain('my-repo');
      expect(path).toContain('scan_');
      expect(path.endsWith('.json')).toBe(true);
    });
  });

  describe('isSemgrepInstalled', () => {
    let mockExecAsync: jest.Mock;

    beforeEach(() => {
      mockExecAsync = jest.fn();
      (promisify as unknown as jest.Mock).mockReturnValue(mockExecAsync);
    });

    it('should pass and return true if semgrep is installed', async () => {
      mockExecAsync.mockResolvedValueOnce({ stdout: '1.50.0\n' });

      const result = await helper.isSemgrepInstalled();
      expect(result).toBe(true);
      expect(mockExecAsync).toHaveBeenCalledWith('semgrep --version');
    });

    it('should fail and return false if semgrep is not found or exec throws', async () => {
      mockExecAsync.mockRejectedValueOnce(new Error('Command failed'));

      const result = await helper.isSemgrepInstalled();
      expect(result).toBe(false);
    });
  });

  describe('executeSemgrep', () => {
    it('should pass with valid command arguments', async () => {
      mockedExecuteCli.mockResolvedValueOnce(undefined as any);

      await helper.executeSemgrep('/repo/path', '/report/path.json');

      expect(mockedExecuteCli).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'semgrep',
          args: expect.arrayContaining([
            'scan',
            '/repo/path',
            '--output',
            '/report/path.json',
          ]),
        }),
      );
    });
  });

  describe('parseSeverity', () => {
    it('should pass with INFO returning 10', () => {
      expect(helper.parseSeverity('INFO')).toBe(10);
      expect(helper.parseSeverity('info')).toBe(10);
    });

    it('should pass with WARNING returning 5', () => {
      expect(helper.parseSeverity('WARNING')).toBe(5);
    });

    it('should pass with ERROR returning 0', () => {
      expect(helper.parseSeverity('ERROR')).toBe(0);
    });

    it('should fail to match and return 0 for unknown severity', () => {
      expect(helper.parseSeverity('CRITICAL')).toBe(0);
    });

    it('should fail to match and return 0 if severity is undefined', () => {
      expect(helper.parseSeverity(undefined)).toBe(0);
    });
  });

  describe('getMark', () => {
    it('should pass with a calculated average if vulnerabilities exist', () => {
      const vulns: any[] = [{ severity: 10 }, { severity: 4 }, { severity: 0 }];
      expect(helper.getMark(vulns)).toBe(7);
    });

    it('should pass with 10 if the vulnerabilities array is empty', () => {
      expect(helper.getMark([])).toBe(10);
    });
  });

  describe('parseResults', () => {
    it('should pass validation with valid JSON data', async () => {
      const mockSemgrepOutput = {
        results: [
          {
            check_id: 'vuln-1',
            path: 'src/main.ts',
            extra: {
              message: 'Found an issue',
              severity: 'WARNING',
              metadata: {
                category: 'security',
                cwe: 'CWE-123',
                owasp: ['A1'],
                impact: 'HIGH',
              },
            },
          },
        ],
      };

      mockedReadFile.mockResolvedValueOnce(JSON.stringify(mockSemgrepOutput));

      const units = await helper.parseResults('/path.json');

      expect(units.length).toBe(1);
      expect(units[0].id).toBe('vuln-1');
      expect(units[0].severity).toBe(5);
      expect(units[0].cwe).toBe('CWE-123');
    });

    it('should pass with an empty array if results are empty', async () => {
      mockedReadFile.mockResolvedValueOnce(JSON.stringify({ results: [] }));

      const units = await helper.parseResults('/path.json');
      expect(units.length).toBe(0);
    });

    it('should pass with an empty array if results property is missing', async () => {
      mockedReadFile.mockResolvedValueOnce(JSON.stringify({}));

      const units = await helper.parseResults('/path.json');
      expect(units.length).toBe(0);
    });

    it('should wrap a scalar owasp string into an array', async () => {
      const mockSemgrepOutput = {
        results: [
          {
            check_id: 'vuln-owasp',
            extra: {
              metadata: {
                owasp: 'A03:2021',
              },
            },
          },
        ],
      };

      mockedReadFile.mockResolvedValueOnce(JSON.stringify(mockSemgrepOutput));

      const units = await helper.parseResults('/path.json');
      expect(units[0].owasp).toEqual(['A03:2021']);
    });

    it('should pass handling an array of cwe and extract the first element', async () => {
      const mockSemgrepOutput = {
        results: [
          {
            check_id: 'vuln-2',
            extra: {
              metadata: {
                cwe: ['CWE-79', 'CWE-80'],
              },
            },
          },
        ],
      };

      mockedReadFile.mockResolvedValueOnce(JSON.stringify(mockSemgrepOutput));

      const units = await helper.parseResults('/path.json');
      expect(units[0].cwe).toBe('CWE-79');
    });
  });
});
