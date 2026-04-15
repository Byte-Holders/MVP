import { Test, TestingModule } from '@nestjs/testing';
import { DOCS_NODE_SERVICE_TOKEN, DocsNodeService } from './docs-node.service';
import { DocsNodeHelper } from './docs-node.helper';

const mockCollectTextFiles = jest.fn();
const mockAnalyzeRepoDocumentation = jest.fn();

const mockHelper: Partial<DocsNodeHelper> = {
    collectTextFiles: mockCollectTextFiles,
    analyzeRepoDocumentation: mockAnalyzeRepoDocumentation,
};

describe('DocsNodeService', () => {
    let service: DocsNodeService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DocsNodeService,
                { provide: DocsNodeHelper, useValue: mockHelper },
            ],
        }).compile();

        service = module.get<DocsNodeService>(DocsNodeService);
    });

    describe('DOCS_NODE_SERVICE_TOKEN', () => {
        it('should equal the expected string literal', () => {
            expect(DOCS_NODE_SERVICE_TOKEN).toBe('DocsNodeService');
        });
    });


    describe('scan', () => {
        const repoPath = '/workspace/my-repo';

        it('should return a partial WorkflowState containing docsReport', async () => {
            const fakeReport = {
                readmeReport: 'Good README',
                commentReport: 'Decent comments',
                mark: 7.5,
            };

            mockCollectTextFiles.mockReturnValueOnce([
                `${repoPath}/src/index.ts`,
                `${repoPath}/src/app.ts`,
            ]);
            mockAnalyzeRepoDocumentation.mockResolvedValueOnce(fakeReport);

            const result = await service.scan({ repoPath });

            expect(result).toEqual({ docsReport: fakeReport });
        });

        it('should call collectTextFiles with the provided repoPath', async () => {
            mockCollectTextFiles.mockReturnValueOnce([]);
            mockAnalyzeRepoDocumentation.mockResolvedValueOnce({
                readmeReport: '',
                commentReport: '',
                mark: 0,
            });

            await service.scan({ repoPath });

            expect(mockCollectTextFiles).toHaveBeenCalledWith(repoPath);
        });

        it('should pass repoPath and collected files to analyzeRepoDocumentation', async () => {
            const files = [`${repoPath}/a.ts`, `${repoPath}/b.ts`];
            mockCollectTextFiles.mockReturnValueOnce(files);
            mockAnalyzeRepoDocumentation.mockResolvedValueOnce({
                readmeReport: 'r',
                commentReport: 'c',
                mark: 9,
            });

            await service.scan({ repoPath });

            expect(mockAnalyzeRepoDocumentation).toHaveBeenCalledWith(
                repoPath,
                files,
            );
        });

        it('should propagate errors thrown by analyzeRepoDocumentation', async () => {
            mockCollectTextFiles.mockReturnValueOnce([]);
            mockAnalyzeRepoDocumentation.mockRejectedValueOnce(
                new Error('analysis failed'),
            );

            await expect(service.scan({ repoPath })).rejects.toThrow(
                'analysis failed',
            );
        });

        it('should work correctly when no files are found in the repo', async () => {
            mockCollectTextFiles.mockReturnValueOnce([]);
            mockAnalyzeRepoDocumentation.mockResolvedValueOnce({
                readmeReport: 'no files',
                commentReport: 'no files',
                mark: 0,
            });

            const result = await service.scan({ repoPath });

            expect(result.docsReport?.mark).toBe(0);
        });
    });
});