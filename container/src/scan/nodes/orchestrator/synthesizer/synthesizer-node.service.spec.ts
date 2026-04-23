import { Test, TestingModule } from '@nestjs/testing';
import { SynthesizerNodeService } from './synthesizer-node.service';
import { SynthesizerNodeHelper } from './synthesizer-node.helper';
import { WorkflowState } from '../workflow-state.type';
import { Report, ReportSummary } from './synthesizer.types';

const FAKE_STATE = { repoPath: '/repo' } as unknown as WorkflowState;

const FAKE_SUMMARY: ReportSummary = { summary: 'ok', mark: 8 };

const FAKE_REPORT = { summary: FAKE_SUMMARY } as unknown as Report;

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('SynthesizerNodeService', () => {
  let service: SynthesizerNodeService;

  const mockGenerateReportSummary = jest.fn();
  const mockAssembleReport = jest.fn();

  const mockHelper: Partial<SynthesizerNodeHelper> = {
    generateReportSummary: mockGenerateReportSummary,
    assembleReport: mockAssembleReport,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGenerateReportSummary.mockResolvedValue(FAKE_SUMMARY);
    mockAssembleReport.mockReturnValue(FAKE_REPORT);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SynthesizerNodeService,
        { provide: SynthesizerNodeHelper, useValue: mockHelper },
      ],
    }).compile();

    service = module.get<SynthesizerNodeService>(SynthesizerNodeService);
  });

  it('should call helper.generateReportSummary with the state', async () => {
    await service.summarize(FAKE_STATE);

    expect(mockGenerateReportSummary).toHaveBeenCalledWith(FAKE_STATE);
  });

  it('should call helper.assembleReport with the state and the summary from generateReportSummary', async () => {
    await service.summarize(FAKE_STATE);

    expect(mockAssembleReport).toHaveBeenCalledWith(FAKE_STATE, FAKE_SUMMARY);
  });

  it('should return the report returned by helper.assembleReport', async () => {
    const result = await service.summarize(FAKE_STATE);

    expect(result).toBe(FAKE_REPORT);
  });
});
