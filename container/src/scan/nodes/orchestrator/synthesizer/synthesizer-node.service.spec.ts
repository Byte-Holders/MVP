import { Test, TestingModule } from '@nestjs/testing';
import { SynthesizerNodeService } from './synthesizer-node.service';
import { SynthesizerNodeHelper } from './synthesizer-node.helper';
import { WorkflowState } from '../workflow-state.type';
import {VulnerabilityUnit} from '../security/security-report.type';


const mockInvoke = jest.fn();

jest.mock('@langchain/aws', () => ({
    ChatBedrockConverse: jest.fn().mockImplementation(() => ({ invoke: mockInvoke })),
}));

jest.mock('@langchain/core/messages', () => ({
    SystemMessage: jest.fn().mockImplementation((t: string) => ({ text: t })),
    HumanMessage: jest.fn().mockImplementation((t: string) => ({ text: t })),
}));


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
            { id: 'rule.A', severity: 'HIGH', message: 'SQL injection', path: '/repo/src/db.ts', remediation: 'Fix it' },
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

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('SynthesizerNodeService', () => {
    let service: SynthesizerNodeService;

    const mockHelper: Partial<SynthesizerNodeHelper> = {
        createModel: jest.fn().mockReturnValue({ invoke: mockInvoke }),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        (mockHelper.createModel as jest.Mock).mockReturnValue({ invoke: mockInvoke });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SynthesizerNodeService,
                { provide: SynthesizerNodeHelper, useValue: mockHelper },
            ],
        }).compile();

        service = module.get<SynthesizerNodeService>(SynthesizerNodeService);
    });

    // ── summarize — happy path ────────────────────────────────────────────────

    describe('summarize — happy path', () => {
        beforeEach(() => {
            mockInvoke.mockResolvedValue({ content: MODEL_SUMMARY });
        });

        it('should return a Report with the model summary and mark', async () => {
            const report = await service.summarize(BASE_STATE);

            expect(report.summary.summary).toBe('Overall the project is in decent shape.');
            expect(report.summary.mark).toBe(7);
        });

        it('should strip markdown fences from the model response before parsing', async () => {
            mockInvoke.mockResolvedValueOnce({
                content: '```json\n' + MODEL_SUMMARY + '\n```',
            });

            const report = await service.summarize(BASE_STATE);

            expect(report.summary.mark).toBe(7);
        });

        it('should include state data in the human message sent to the model', async () => {
            await service.summarize(BASE_STATE);

            const humanMsg = mockInvoke.mock.calls[0][0][1].text as string;
            expect(humanMsg).toContain('vulnerabilities');
            expect(humanMsg).toContain('documentation');
            expect(humanMsg).toContain('testReport');
            expect(humanMsg).toContain('languages');
        });

        it('should set report metadata with the correct target and startScanTime', async () => {
            const report = await service.summarize(BASE_STATE);

            expect(report.metadata.target).toBe('https://github.com/org/repo');
            expect(report.metadata.startScanTime).toEqual(START_TIME);
        });

        it('should set endScanTime close to now', async () => {
            const before = new Date();
            const report = await service.summarize(BASE_STATE);
            const after = new Date();

            expect(report.metadata.endScanTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(report.metadata.endScanTime.getTime()).toBeLessThanOrEqual(after.getTime());
        });

        it('should strip list, libraries and frameworks from depsReport in data', async () => {
            const report = await service.summarize(BASE_STATE);

            // list/libraries/frameworks must not appear in depsReport inside data
            expect((report.data.depsReport as any).list).toBeUndefined();
            expect((report.data.depsReport as any).libraries).toBeUndefined();
            expect((report.data.depsReport as any).frameworks).toBeUndefined();
        });

        it('should move libraries and frameworks to techReport', async () => {
            const report = await service.summarize(BASE_STATE);

            expect(report.data.techReport.libraries).toEqual([
                { name: 'lodash', version: '4.17.21' },
            ]);
            expect(report.data.techReport.frameworks).toEqual([
                { name: 'nestjs', version: '10.0.0' },
            ]);
        });

        it('should include state languages in techReport', async () => {
            const report = await service.summarize(BASE_STATE);

            expect(report.data.techReport.languages).toEqual(['TypeScript', 'JavaScript']);
        });

        it('should embed vulnerabilitiesReport in data', async () => {
            const report = await service.summarize(BASE_STATE);

            expect(report.data.vulnerabilitiesReport.mark).toBe(6);
            expect(report.data.vulnerabilitiesReport.vulnerabilities).toHaveLength(1);
        });

        it('should embed docsReport in data', async () => {
            const report = await service.summarize(BASE_STATE);

            expect(report.data.docsReport.mark).toBe(7);
            expect(report.data.docsReport.readmeReport).toBe('Good README');
        });

        it('should embed testReport in data', async () => {
            const report = await service.summarize(BASE_STATE);

            expect(report.data.testReport.testsRun).toBe(42);
            expect(report.data.testReport.coverageReport.statements).toBe(80);
        });
    });

    // ── summarize — fallback on model error ───────────────────────────────────

    describe('summarize — model error fallback', () => {
        it('should use fallback summary and mark 1 when the model throws', async () => {
            mockInvoke.mockRejectedValueOnce(new Error('Bedrock error'));

            const report = await service.summarize(BASE_STATE);

            expect(report.summary.mark).toBe(1);
            expect(report.summary.summary).toContain('errore');
        });

        it('should still return a complete Report structure when the model throws', async () => {
            mockInvoke.mockRejectedValueOnce(new Error('Bedrock error'));

            const report = await service.summarize(BASE_STATE);

            expect(report.data).toBeDefined();
            expect(report.metadata).toBeDefined();
        });

        it('should use fallback summary and mark 1 when the model returns invalid JSON', async () => {
            mockInvoke.mockResolvedValueOnce({ content: 'not-valid-json' });

            const report = await service.summarize(BASE_STATE);

            expect(report.summary.mark).toBe(1);
        });
    });

    // ── summarize — missing state fields ─────────────────────────────────────

    describe('summarize — missing state fields', () => {
        beforeEach(() => {
            mockInvoke.mockResolvedValue({ content: MODEL_SUMMARY });
        });

        it('should default depsReport to empty when state.depsReport is undefined', async () => {
            const state: WorkflowState = { ...BASE_STATE, depsReport: undefined };

            const report = await service.summarize(state);

            expect(report.data.depsReport).toBeDefined();
            expect(report.data.techReport.libraries).toEqual([]);
            expect(report.data.techReport.frameworks).toEqual([]);
        });

        it('should default vulnerabilitiesReport when missing', async () => {
            const state: WorkflowState = { ...BASE_STATE, vulnerabilitiesReport: undefined };

            const report = await service.summarize(state);

            expect(report.data.vulnerabilitiesReport).toEqual({
                vulnerabilities: [],
                mark: 10,
            });
        });

        it('should default docsReport when missing', async () => {
            const state: WorkflowState = { ...BASE_STATE, docsReport: undefined };

            const report = await service.summarize(state);

            expect(report.data.docsReport).toEqual({
                readmeReport: '',
                commentReport: '',
                mark: 0,
            });
        });

        it('should default testReport when missing', async () => {
            const state: WorkflowState = { ...BASE_STATE, testReport: undefined };

            const report = await service.summarize(state);

            expect(report.data.testReport).toEqual({
                coverageReport: { statements: 0, branches: 0, functions: 0, lines: 0 },
                failedTests: [],
                testsRun: 0,
            });
        });

        it('should default languages to empty array when missing', async () => {
            const state: WorkflowState = { ...BASE_STATE, languages: undefined };

            const report = await service.summarize(state);

            expect(report.data.techReport.languages).toEqual([]);
        });
    });
});