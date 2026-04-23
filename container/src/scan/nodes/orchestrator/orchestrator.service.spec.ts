/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorHelper } from './orchestrator.helper';
import { COVERAGE_NODE_SERVICE_TOKEN } from './coverage/coverage-node.service';
import { GITHUB_NODE_SERVICE_TOKEN } from './github/github-node.service';
import { SECURITY_NODE_SERVICE_TOKEN } from './security/security-node.service';
import { REMEDIATION_NODE_SERVICE_TOKEN } from './remediation/remediation-node.service';
import { DEPENDENCY_NODE_SERVICE_TOKEN } from './dependency/dependency-node.service';
import { DOCS_NODE_SERVICE_TOKEN } from './docs/docs-node.service';
import { SynthesizerNodeService } from './synthesizer/synthesizer-node.service';
import { Report } from './synthesizer/synthesizer.types';
import { Target } from '../../target.types';
import { INodeScanService } from './inode-scan-service.interface';
import { StateGraph } from '@langchain/langgraph';

const mockTarget = (): Target => ({
  owner: 'myOwner',
  repository: 'myRepo',
  branch: 'myBranch',
  accessToken: 'myAccessToken',
});

const mockReport = (): Report => ({
  summary: {
    summary: 'mySummary',
    mark: 7,
  },
  data: {
    depsReport: {
      vulnerabilities: [],
      vulnerabilityAnalysis: 'myAnalysis',
    },
    vulnerabilitiesReport: {
      vulnerabilities: [],
      mark: 8,
    },
    docsReport: {
      readmeReport: 'myReadme',
      commentReport: 'myComments',
      mark: 6,
    },
    testReport: {
      coverageReport: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 90,
      },
      failedTests: [],
      testsRun: 20,
    },
    techReport: {
      libraries: [],
      frameworks: [],
      languages: [],
    },
  },
  metadata: {
    startScanTime: new Date(0),
    endScanTime: new Date(10),
    target: mockTarget(),
  },
});

const mockNodeService = (): jest.Mocked<INodeScanService> => ({
  scan: jest.fn().mockResolvedValue({}),
});

describe('OrchestratorService', () => {
  let mockInvoke: jest.Mock;
  let orchestratorService: OrchestratorService;
  let mockHelper: { cloneRepo: jest.Mock };
  let coverageNode: jest.Mocked<INodeScanService>;
  let githubNode: jest.Mocked<INodeScanService>;
  let securityNode: jest.Mocked<INodeScanService>;
  let remediationNode: jest.Mocked<INodeScanService>;
  let dependencyNode: jest.Mocked<INodeScanService>;
  let docsNode: jest.Mocked<INodeScanService>;
  let synthesizerNode: { summarize: jest.Mock };

  beforeEach(async () => {
    mockInvoke = jest.fn();
    mockHelper = { cloneRepo: jest.fn().mockResolvedValue('myClonedPath') };
    coverageNode = mockNodeService();
    githubNode = mockNodeService();
    securityNode = mockNodeService();
    remediationNode = mockNodeService();
    dependencyNode = mockNodeService();
    docsNode = mockNodeService();
    synthesizerNode = { summarize: jest.fn().mockResolvedValue(mockReport()) };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    jest.spyOn(StateGraph.prototype, 'compile').mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      invoke: (...args: unknown[]) => mockInvoke(...args),
    } as any);

    const app = await Test.createTestingModule({
      providers: [
        OrchestratorService,
        { provide: OrchestratorHelper, useValue: mockHelper },
        { provide: COVERAGE_NODE_SERVICE_TOKEN, useValue: coverageNode },
        { provide: GITHUB_NODE_SERVICE_TOKEN, useValue: githubNode },
        { provide: SECURITY_NODE_SERVICE_TOKEN, useValue: securityNode },
        { provide: REMEDIATION_NODE_SERVICE_TOKEN, useValue: remediationNode },
        { provide: DEPENDENCY_NODE_SERVICE_TOKEN, useValue: dependencyNode },
        { provide: DOCS_NODE_SERVICE_TOKEN, useValue: docsNode },
        { provide: SynthesizerNodeService, useValue: synthesizerNode },
      ],
    }).compile();

    orchestratorService = app.get<OrchestratorService>(OrchestratorService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('is defined', () => {
    expect(orchestratorService).toBeDefined();
  });

  it('returns the final report when invoke resolves with a report', async () => {
    mockInvoke.mockReturnValue({ finalReport: mockReport() });

    const result = await orchestratorService.execute(mockTarget());

    expect(result).toStrictEqual(mockReport());
  });

  it('rejects when the workflow execution rejects', async () => {
    mockInvoke.mockRejectedValue(new Error());

    await expect(orchestratorService.execute(mockTarget())).rejects.toThrow();
  });

  it('throws when invoke resolves with undefined finalReport', async () => {
    mockInvoke.mockResolvedValue(undefined);

    await expect(orchestratorService.execute(mockTarget())).rejects.toThrow();
  });
});
