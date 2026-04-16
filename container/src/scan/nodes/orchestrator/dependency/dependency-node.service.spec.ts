import { Test, TestingModule } from '@nestjs/testing';
import { DependencyNodeService } from './dependency-node.service';
import { DependencyNodeHelper, DependencyVulnerability } from './dependency-node.helper';

const DEPS_LIST = [
    { name: 'lodash', version: '4.17.21' },
    { name: 'express', version: '4.18.2' },
];

const RAW_VULNERABILITIES: DependencyVulnerability[] = [
    {
        id: 'CVE-2021-23337',
        severity: 'High',
        description: 'Command injection vulnerability',
        packageName: 'lodash',
        packageVersion: '4.17.20',
        fixVersion: '4.17.21',
    },
];

const TRANSLATED_VULNERABILITIES: DependencyVulnerability[] = [
    {
        ...RAW_VULNERABILITIES[0],
        description: 'Vulnerabilità di iniezione comandi',
    },
];

const ANALYSIS_RESULT = {
    libraries: [{ name: 'lodash', version: '4.17.21' }],
    frameworks: [{ name: 'nestjs', version: '10.0.0' }],
    vulnerabilityAnalysis: 'Analisi riassuntiva delle vulnerabilità.',
};


function createHelperMock(): jest.Mocked<DependencyNodeHelper> {
    return {
        createModel: jest.fn(),
        executeSyft: jest.fn().mockResolvedValue('{}'),
        parseSbom: jest.fn().mockReturnValue(DEPS_LIST),
        executeGrype: jest.fn().mockResolvedValue('{}'),
        parseGrype: jest.fn().mockReturnValue(RAW_VULNERABILITIES),
        translateDescriptions: jest.fn().mockResolvedValue(TRANSLATED_VULNERABILITIES),
        analyzeDependencies: jest.fn().mockResolvedValue(ANALYSIS_RESULT),
    } as unknown as jest.Mocked<DependencyNodeHelper>;
}

describe('DependencyNodeService', () => {
    let service: DependencyNodeService;
    let helper: jest.Mocked<DependencyNodeHelper>;

    beforeEach(async () => {
        helper = createHelperMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DependencyNodeService,
                { provide: DependencyNodeHelper, useValue: helper },
            ],
        }).compile();

        service = module.get<DependencyNodeService>(DependencyNodeService);
    });

    afterEach(() => jest.clearAllMocks());


    describe('scan', () => {
        it('should orchestrate all helper steps in the correct order', async () => {
            const callOrder: string[] = [];
            helper.executeSyft.mockImplementation(async () => { callOrder.push('executeSyft'); return '{}'; });
            helper.parseSbom.mockImplementation(() => { callOrder.push('parseSbom'); return DEPS_LIST; });
            helper.executeGrype.mockImplementation(async () => { callOrder.push('executeGrype'); return '{}'; });
            helper.parseGrype.mockImplementation(() => { callOrder.push('parseGrype'); return RAW_VULNERABILITIES; });
            helper.translateDescriptions.mockImplementation(async () => { callOrder.push('translateDescriptions'); return TRANSLATED_VULNERABILITIES; });
            helper.analyzeDependencies.mockImplementation(async () => { callOrder.push('analyzeDependencies'); return ANALYSIS_RESULT; });

            await service.scan({ repoPath: '/repo' });

            expect(callOrder).toEqual([
                'executeSyft',
                'parseSbom',
                'executeGrype',
                'parseGrype',
                'translateDescriptions',
                'analyzeDependencies',
            ]);
        });

        it('should return a depsReport with all populated fields', async () => {
            const result = await service.scan({ repoPath: '/repo' });

            expect(result).toEqual({
                depsReport: {
                    list: DEPS_LIST,
                    libraries: ANALYSIS_RESULT.libraries,
                    frameworks: ANALYSIS_RESULT.frameworks,
                    vulnerabilities: [
                        {
                            id: 'CVE-2021-23337',
                            severity: 'High',
                            description: 'Vulnerabilità di iniezione comandi',
                            packageName: 'lodash',
                            packageVersion: '4.17.20',
                            fixVersion: '4.17.21',
                        },
                    ],
                    vulnerabilityAnalysis: ANALYSIS_RESULT.vulnerabilityAnalysis,
                },
            });
        });

        it('should pass repoPath to executeSyft', async () => {
            await service.scan({ repoPath: '/my/custom/repo' });
            expect(helper.executeSyft).toHaveBeenCalledWith('/my/custom/repo');
        });

        it('should pass the sbom output to executeGrype', async () => {
            const sbomOutput = '{"artifacts":[]}';
            helper.executeSyft.mockResolvedValue(sbomOutput);

            await service.scan({ repoPath: '/repo' });

            expect(helper.executeGrype).toHaveBeenCalledWith(sbomOutput);
        });

        it('should pass translated vulnerabilities to analyzeDependencies', async () => {
            await service.scan({ repoPath: '/repo' });

            expect(helper.analyzeDependencies).toHaveBeenCalledWith(
                '/repo',
                DEPS_LIST,
                TRANSLATED_VULNERABILITIES,
            );
        });

        it('should map vulnerability fields correctly into the report', async () => {
            const vulnWithoutFix: DependencyVulnerability = {
                id: 'CVE-2022-99999',
                severity: 'Low',
                description: 'Minor flaw',
                packageName: 'express',
                packageVersion: '4.18.1',
                fixVersion: undefined,
            };
            helper.translateDescriptions.mockResolvedValue([vulnWithoutFix]);

            const result = await service.scan({ repoPath: '/repo' });

            expect((result.depsReport as any).vulnerabilities[0].fixVersion).toBeUndefined();
        });
    });


    describe('scan – grype failure', () => {
        beforeEach(() => {
            helper.executeGrype.mockRejectedValue(new Error('grype binary not found'));
        });

        it('should continue the workflow even when grype fails', async () => {
            const result = await service.scan({ repoPath: '/repo' });
            expect(result.depsReport).toBeDefined();
        });

        it('should pass an empty vulnerabilities list to translateDescriptions when grype fails', async () => {
            await service.scan({ repoPath: '/repo' });
            expect(helper.translateDescriptions).toHaveBeenCalledWith([]);
        });

        it('should still call analyzeDependencies after a grype failure', async () => {
            await service.scan({ repoPath: '/repo' });
            expect(helper.analyzeDependencies).toHaveBeenCalled();
        });

        it('should return an empty vulnerabilities array in the report', async () => {
            helper.translateDescriptions.mockResolvedValue([]);
            const result = await service.scan({ repoPath: '/repo' });
            expect((result.depsReport as any).vulnerabilities).toEqual([]);
        });
    });

    describe('scan – syft failure', () => {
        beforeEach(() => {
            helper.executeSyft.mockRejectedValue(new Error('syft binary not found'));
        });

        it('should return the default empty DepsReport', async () => {
            const result = await service.scan({ repoPath: '/repo' });

            expect(result).toEqual({
                depsReport: {
                    list: [],
                    libraries: [],
                    frameworks: [],
                    vulnerabilities: [],
                    vulnerabilityAnalysis: '',
                },
            });
        });

        it('should not call any subsequent helper methods after syft fails', async () => {
            await service.scan({ repoPath: '/repo' });

            expect(helper.parseSbom).not.toHaveBeenCalled();
            expect(helper.executeGrype).not.toHaveBeenCalled();
            expect(helper.translateDescriptions).not.toHaveBeenCalled();
            expect(helper.analyzeDependencies).not.toHaveBeenCalled();
        });
    });


    describe('scan – analyzeDependencies failure', () => {
        it('should propagate the error and return the default report', async () => {
            helper.analyzeDependencies.mockRejectedValue(new Error('LLM unavailable'));

            const result = await service.scan({ repoPath: '/repo' });

            expect(result).toEqual({
                depsReport: {
                    list: [],
                    libraries: [],
                    frameworks: [],
                    vulnerabilities: [],
                    vulnerabilityAnalysis: '',
                },
            });
        });
    });


    describe('scan – empty results', () => {
        it('should handle a repo with no dependencies', async () => {
            helper.parseSbom.mockReturnValue([]);
            helper.parseGrype.mockReturnValue([]);
            helper.translateDescriptions.mockResolvedValue([]);
            helper.analyzeDependencies.mockResolvedValue({
                libraries: [],
                frameworks: [],
                vulnerabilityAnalysis: 'Nessuna vulnerabilità rilevata.',
            });

            const result = await service.scan({ repoPath: '/empty-repo' });

            expect((result.depsReport as any).list).toEqual([]);
            expect((result.depsReport as any).vulnerabilities).toEqual([]);
            expect((result.depsReport as any).vulnerabilityAnalysis).toBe(
                'Nessuna vulnerabilità rilevata.',
            );
        });
    });
});