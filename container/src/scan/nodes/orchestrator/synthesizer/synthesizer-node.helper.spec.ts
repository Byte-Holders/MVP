import { Test, TestingModule } from '@nestjs/testing';
import { SynthesizerNodeHelper } from './synthesizer-node.helper';
import { ChatBedrockConverse } from '@langchain/aws';
import { WorkflowState } from '../workflow-state.type';
import { ReportSummary } from './synthesizer.types';

const mockInvoke = jest.fn();

jest.mock('@langchain/aws', () => ({
  ChatBedrockConverse: jest
    .fn()
    .mockImplementation(() => ({ invoke: mockInvoke })),
}));

jest.mock('@langchain/core/messages', () => ({
  SystemMessage: jest.fn().mockImplementation((t: string) => ({ text: t })),
  HumanMessage: jest.fn().mockImplementation((t: string) => ({ text: t })),
}));

const mockChatBedrockConverse = ChatBedrockConverse as jest.Mock;

const START_TIME = new Date('2024-01-01T10:00:00Z');

const BASE_STATE: WorkflowState = {
  repoPath: '/repo',
  target: 'https://github.com/org/repo',
  startScanTime: START_TIME,
  languages: ['TypeScript', 'JavaScript'],
  depsReport: {
    list: [{ name: 'lodash', version: '4.17.21' }],
    libraries: [{ name: 'lodash', version: '4.17.21' }],
    frameworks: [{ name: 'nestjs', version: '10.0.0' }],
    vulnerabilities: [],
    vulnerabilityAnalysis: 'No critical issues.',
  },
  vulnerabilitiesReport: {
    vulnerabilities: [
      {
        id: 'rule.A',
        severity: 'HIGH',
        message: 'SQL injection',
        path: '/repo/src/db.ts',
        remediation: 'Fix it',
      },
    ],
    mark: 6,
  },
  docsReport: {
    readmeReport: 'Good README',
    commentReport: 'Decent comments',
    mark: 7,
  },
  testReport: {
    coverageReport: { statements: 80, branches: 70, functions: 75, lines: 78 },
    failedTests: [],
    testsRun: 42,
  },
};

const MODEL_SUMMARY = JSON.stringify({
  summary: 'Overall the project is in decent shape.',
  mark: 7,
});

const SUMMARY_FIXTURE: ReportSummary = {
  summary: 'Overall the project is in decent shape.',
  mark: 7,
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('SynthesizerNodeHelper', () => {
  let helper: SynthesizerNodeHelper;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockChatBedrockConverse.mockImplementation(() => ({ invoke: mockInvoke }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [SynthesizerNodeHelper],
    }).compile();

    helper = module.get<SynthesizerNodeHelper>(SynthesizerNodeHelper);
  });

  // ── createModel ───────────────────────────────────────────────────────────

  describe('createModel', () => {
    it('should return a ChatBedrockConverse instance', () => {
      const model = helper.createModel();
      expect(model).toBeDefined();
    });

    it('should use default model and region when env vars are not set', () => {
      delete process.env.BEDROCK_MODEL_ID;
      delete process.env.BEDROCK_AWS_REGION;

      helper.createModel();

      expect(mockChatBedrockConverse).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'deepseek.v3.2',
          region: 'eu-north-1',
          temperature: 0,
          maxTokens: 5000,
        }),
      );
    });

    it('should use env vars when set', () => {
      process.env.BEDROCK_MODEL_ID = 'my-model';
      process.env.BEDROCK_AWS_REGION = 'us-east-1';

      helper.createModel();

      expect(mockChatBedrockConverse).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'my-model',
          region: 'us-east-1',
        }),
      );

      delete process.env.BEDROCK_MODEL_ID;
      delete process.env.BEDROCK_AWS_REGION;
    });
  });

  // ── generateReportSummary — happy path ────────────────────────────────────

  describe('generateReportSummary — happy path', () => {
    beforeEach(() => {
      mockInvoke.mockResolvedValue({ content: MODEL_SUMMARY });
    });

    it('should return a ReportSummary with summary and mark from the model response', async () => {
      const result = await helper.generateReportSummary(BASE_STATE);

      expect(result.summary).toBe('Overall the project is in decent shape.');
      expect(result.mark).toBe(7);
    });

    it('should strip markdown fences before parsing the model response', async () => {
      mockInvoke.mockResolvedValueOnce({
        content: '```json\n' + MODEL_SUMMARY + '\n```',
      });

      const result = await helper.generateReportSummary(BASE_STATE);

      expect(result.mark).toBe(7);
    });

    it('should include vulnerabilities, testReport, documentation and languages in the human message', async () => {
      await helper.generateReportSummary(BASE_STATE);

      const humanMsg = mockInvoke.mock.calls[0][0][1].text as string;
      expect(humanMsg).toContain('vulnerabilities');
      expect(humanMsg).toContain('documentation');
      expect(humanMsg).toContain('testReport');
      expect(humanMsg).toContain('languages');
    });
  });

  // ── generateReportSummary — error fallback ────────────────────────────────

  describe('generateReportSummary — error fallback', () => {
    it('should return fallback with mark 1 when the model throws', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Bedrock error'));

      const result = await helper.generateReportSummary(BASE_STATE);

      expect(result.mark).toBe(1);
      expect(result.summary).toContain('errore');
    });

    it('should return fallback with mark 1 when the model returns invalid JSON', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'not-valid-json' });

      const result = await helper.generateReportSummary(BASE_STATE);

      expect(result.mark).toBe(1);
    });
  });

  // ── assembleReport ────────────────────────────────────────────────────────

  describe('assembleReport', () => {
    it('should set report metadata with correct target and startScanTime', () => {
      const report = helper.assembleReport(BASE_STATE, SUMMARY_FIXTURE);

      expect(report.metadata.target).toBe('https://github.com/org/repo');
      expect(report.metadata.startScanTime).toEqual(START_TIME);
    });

    it('should set endScanTime close to now', () => {
      const before = new Date();
      const report = helper.assembleReport(BASE_STATE, SUMMARY_FIXTURE);
      const after = new Date();

      expect(report.metadata.endScanTime.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(report.metadata.endScanTime.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });

    it('should strip list, libraries and frameworks from depsReport in data', () => {
      const report = helper.assembleReport(BASE_STATE, SUMMARY_FIXTURE);

      expect((report.data.depsReport as any).list).toBeUndefined();
      expect((report.data.depsReport as any).libraries).toBeUndefined();
      expect((report.data.depsReport as any).frameworks).toBeUndefined();
    });

    it('should move libraries and frameworks to techReport', () => {
      const report = helper.assembleReport(BASE_STATE, SUMMARY_FIXTURE);

      expect(report.data.techReport.libraries).toEqual([
        { name: 'lodash', version: '4.17.21' },
      ]);
      expect(report.data.techReport.frameworks).toEqual([
        { name: 'nestjs', version: '10.0.0' },
      ]);
    });

    it('should include state languages in techReport', () => {
      const report = helper.assembleReport(BASE_STATE, SUMMARY_FIXTURE);

      expect(report.data.techReport.languages).toEqual([
        'TypeScript',
        'JavaScript',
      ]);
    });

    it('should embed vulnerabilitiesReport in data', () => {
      const report = helper.assembleReport(BASE_STATE, SUMMARY_FIXTURE);

      expect(report.data.vulnerabilitiesReport.mark).toBe(6);
      expect(report.data.vulnerabilitiesReport.vulnerabilities).toHaveLength(1);
    });

    it('should embed docsReport in data', () => {
      const report = helper.assembleReport(BASE_STATE, SUMMARY_FIXTURE);

      expect(report.data.docsReport.mark).toBe(7);
      expect(report.data.docsReport.readmeReport).toBe('Good README');
    });

    it('should embed testReport in data', () => {
      const report = helper.assembleReport(BASE_STATE, SUMMARY_FIXTURE);

      expect(report.data.testReport.testsRun).toBe(42);
      expect(report.data.testReport.coverageReport.statements).toBe(80);
    });

    it('should place the summary argument on report.summary', () => {
      const report = helper.assembleReport(BASE_STATE, SUMMARY_FIXTURE);

      expect(report.summary).toBe(SUMMARY_FIXTURE);
    });

    it('should default depsReport fields when state.depsReport is undefined', () => {
      const state: WorkflowState = { ...BASE_STATE, depsReport: undefined };
      const report = helper.assembleReport(state, SUMMARY_FIXTURE);

      expect(report.data.depsReport).toBeDefined();
      expect(report.data.techReport.libraries).toEqual([]);
      expect(report.data.techReport.frameworks).toEqual([]);
    });

    it('should default vulnerabilitiesReport when missing', () => {
      const state: WorkflowState = {
        ...BASE_STATE,
        vulnerabilitiesReport: undefined,
      };
      const report = helper.assembleReport(state, SUMMARY_FIXTURE);

      expect(report.data.vulnerabilitiesReport).toEqual({
        vulnerabilities: [],
        mark: 10,
      });
    });

    it('should default docsReport when missing', () => {
      const state: WorkflowState = { ...BASE_STATE, docsReport: undefined };
      const report = helper.assembleReport(state, SUMMARY_FIXTURE);

      expect(report.data.docsReport).toEqual({
        readmeReport: '',
        commentReport: '',
        mark: 0,
      });
    });

    it('should default testReport when missing', () => {
      const state: WorkflowState = { ...BASE_STATE, testReport: undefined };
      const report = helper.assembleReport(state, SUMMARY_FIXTURE);

      expect(report.data.testReport).toEqual({
        coverageReport: { statements: 0, branches: 0, functions: 0, lines: 0 },
        failedTests: [],
        testsRun: 0,
      });
    });

    it('should default languages to empty array when missing', () => {
      const state: WorkflowState = { ...BASE_STATE, languages: undefined };
      const report = helper.assembleReport(state, SUMMARY_FIXTURE);

      expect(report.data.techReport.languages).toEqual([]);
    });
  });
});
