/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CoverageNodeService } from './coverage-node.service';
import { CoverageNodeHelper } from './coverage-node.helper';
import { TestReport } from './coverage-report.type';

const mockWholeReport = (overrides?: Partial<TestReport>): TestReport => ({
  coverageReport: {
    statements: 37.84,
    branches: 29.18,
    functions: 29.06,
    lines: 36.53,
  },
  failedTests: [
    {
      name: 'myFullName',
      path: 'myPath',
      messageSummary: 'myFailureMessage',
    },
  ],
  testsRun: 3,
  ...overrides,
});

const DEFAULT_TEST_REPORT: TestReport = {
  coverageReport: {
    statements: 0,
    branches: 0,
    functions: 0,
    lines: 0,
  },
  failedTests: [],
  testsRun: 0,
};

const VALID_STDOUT = `Statements   : 37.84% ( 246/650 )
  Branches     : 29.18% ( 61/209 )
  Functions    : 29.06% ( 25/86 )
  Lines        : 36.53% ( 209/572 )`;

const VALID_JEST_REPORT = `{
    "numTotalTests": 3,
    "testResults": [
        {
            "assertionResults": [
                {
                    "failureMessages": [],
                    "fullName": "myPassName1",
                    "status": "passed"
                }
            ],
            "name": "myPassPath1"
        },
        {
            "assertionResults": [
               {
                    "failureMessages": [],
                    "fullName": "myPassName2",
                    "status": "passed"
                },
                {
                    "failureMessages": [
                        "myFailureMessage"
                    ],
                    "fullName": "myFullName",
                    "status": "failed"
                }
            ],
            "name": "myPath"
        }
    ]
}`;

const REPO_PATH = 'myRepoPath';

describe('CoverageNodeService', () => {
  let service: CoverageNodeService;
  let helper: jest.Mocked<CoverageNodeHelper>;

  beforeEach(async () => {
    helper = {
      runCoverageTool: jest.fn().mockResolvedValue({
        stdout: VALID_STDOUT,
        resultsPath: 'myResultsPath',
      }),
      checkFileExists: jest.fn().mockReturnValue(true),
      getFileContentsRaw: jest.fn().mockReturnValue(VALID_JEST_REPORT),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoverageNodeService,
        { provide: CoverageNodeHelper, useValue: helper },
      ],
    }).compile();

    service = module.get<CoverageNodeService>(CoverageNodeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scan', () => {
    it('should return an empty report when package.json does not exist', async () => {
      helper.checkFileExists.mockReturnValue(false);

      const result = await service.scan({ repoPath: REPO_PATH });

      expect(result).toEqual({ testReport: DEFAULT_TEST_REPORT });
    });

    it('should return an empty report when the coverage tool rejects', async () => {
      helper.runCoverageTool.mockRejectedValue(new Error());

      const result = await service.scan({ repoPath: REPO_PATH });

      expect(result).toEqual({ testReport: DEFAULT_TEST_REPORT });
    });

    it('should return an empty report when parsing fails', async () => {
      const unparsable = 'a';
      const resultsPath = 'myResultsPath';

      helper.runCoverageTool.mockResolvedValue({
        stdout: unparsable,
        resultsPath,
      });

      const result = await service.scan({ repoPath: REPO_PATH });

      expect(result).toEqual({ testReport: DEFAULT_TEST_REPORT });
    });

    it('should return the parsed report on the happy path', async () => {
      const result = await service.scan({ repoPath: REPO_PATH });

      expect(result).toEqual({ testReport: mockWholeReport() });
    });
  });
});
