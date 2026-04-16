import { Test, TestingModule } from '@nestjs/testing';
import { DocsNodeHelper } from './docs-node.helper';
import path from 'path';
import fs from 'fs';

const mockInvoke = jest.fn();

jest.mock('@langchain/aws', () => ({
  ChatBedrockConverse: jest.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}));

jest.mock('@langchain/core/messages', () => ({
  SystemMessage: jest.fn().mockImplementation((text: string) => ({ text })),
  HumanMessage: jest.fn().mockImplementation((text: string) => ({ text })),
}));

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

const makeSection = (header: string, sizeBytes: number) => ({
  header,
  content: `### File: ${header}\n\`\`\`\ncontent\n\`\`\``,
  sizeBytes,
});

describe('DocsNodeHelper', () => {
  let helper: DocsNodeHelper;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DocsNodeHelper],
    }).compile();

    helper = module.get<DocsNodeHelper>(DocsNodeHelper);
  });

  describe('createModel', () => {
    it('should return a ChatBedrockConverse instance', () => {
      const model = helper.createModel();
      expect(model).toBeDefined();
      expect(model.invoke).toBeDefined();
    });

    it('should use env variables when set', () => {
      const { ChatBedrockConverse } = require('@langchain/aws');
      process.env.BEDROCK_MODEL_ID = 'custom-model';
      process.env.BEDROCK_AWS_REGION = 'us-east-1';

      helper.createModel();

      expect(ChatBedrockConverse).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'custom-model',
          region: 'us-east-1',
        }),
      );

      delete process.env.BEDROCK_MODEL_ID;
      delete process.env.BEDROCK_AWS_REGION;
    });

    it('should fall back to defaults when env variables are not set', () => {
      const { ChatBedrockConverse } = require('@langchain/aws');
      delete process.env.BEDROCK_MODEL_ID;
      delete process.env.BEDROCK_AWS_REGION;

      helper.createModel();

      expect(ChatBedrockConverse).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'deepseek.v3.2',
          region: 'eu-north-1',
        }),
      );
    });
  });

  describe('buildSections', () => {
    const repoPath = path.join(path.sep, 'repo');

    it('should build a section for each non-README file', () => {
      const files = [
        path.join(repoPath, 'src', 'index.ts'),
        path.join(repoPath, 'src', 'app.ts'),
      ];
      (mockedFs.readFileSync as jest.Mock).mockReturnValue('const x = 1;');

      const sections = helper.buildSections(repoPath, files);

      expect(sections).toHaveLength(2);
      expect(sections[0].header).toBe(path.join('src', 'index.ts'));
      expect(sections[1].header).toBe(path.join('src', 'app.ts'));
    });

    it('should skip README.md', () => {
      const files = [
        path.join(repoPath, 'README.md'),
        path.join(repoPath, 'src', 'index.ts'),
      ];
      (mockedFs.readFileSync as jest.Mock).mockReturnValue('content');

      const sections = helper.buildSections(repoPath, files);

      expect(sections).toHaveLength(1);
      expect(sections[0].header).toBe(path.join('src', 'index.ts'));
    });

    it('should include file content wrapped in a code block', () => {
      const files = [path.join(repoPath, 'src', 'main.ts')];
      (mockedFs.readFileSync as jest.Mock).mockReturnValue('export {}');

      const sections = helper.buildSections(repoPath, files);

      expect(sections[0].content).toContain(
        `### File: ${path.join('src', 'main.ts')}`,
      );
      expect(sections[0].content).toContain('```');
      expect(sections[0].content).toContain('export {}');
    });

    it('should compute sizeBytes based on content', () => {
      const files = [path.join(repoPath, 'src', 'a.ts')];
      (mockedFs.readFileSync as jest.Mock).mockReturnValue('hello');

      const sections = helper.buildSections(repoPath, files);

      expect(sections[0].sizeBytes).toBeGreaterThan(0);
      expect(sections[0].sizeBytes).toBe(
        Buffer.byteLength(sections[0].content, 'utf-8'),
      );
    });

    it('should return empty array when only README.md is provided', () => {
      const files = [path.join(repoPath, 'README.md')];
      (mockedFs.readFileSync as jest.Mock).mockReturnValue('# readme');

      const sections = helper.buildSections(repoPath, files);

      expect(sections).toHaveLength(0);
    });
  });

  describe('createBatches', () => {
    // BATCH_SIZE_BYTES = 512 * 1024 = 524288 bytes

    it('should put all sections in one batch when total size is under limit', () => {
      const sections = [makeSection('a.ts', 100), makeSection('b.ts', 200)];

      const batches = helper.createBatches(sections);

      expect(batches).toHaveLength(1);
      expect(batches[0]).toHaveLength(2);
    });

    it('should split into multiple batches when size exceeds limit', () => {
      // Each section is 300 KB; two of them exceed 512 KB
      const KB300 = 300 * 1024;
      const sections = [
        makeSection('a.ts', KB300),
        makeSection('b.ts', KB300),
        makeSection('c.ts', KB300),
      ];

      const batches = helper.createBatches(sections);

      expect(batches.length).toBeGreaterThan(1);
    });

    it('should not lose any sections across batches', () => {
      const KB300 = 300 * 1024;
      const sections = [
        makeSection('a.ts', KB300),
        makeSection('b.ts', KB300),
        makeSection('c.ts', KB300),
      ];

      const batches = helper.createBatches(sections);
      const flat = batches.flat();

      expect(flat).toHaveLength(sections.length);
    });

    it('should return one batch containing a single oversized section', () => {
      const sections = [makeSection('huge.ts', 600 * 1024)];

      const batches = helper.createBatches(sections);

      expect(batches).toHaveLength(1);
      expect(batches[0][0].header).toBe('huge.ts');
    });

    it('should return empty array for empty input', () => {
      const batches = helper.createBatches([]);
      expect(batches).toHaveLength(0);
    });
  });

  describe('processBatch', () => {
    it('should return model response content as string', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'batch analysis result' });

      const batch = [makeSection('a.ts', 100)];
      const result = await helper.processBatch(batch, 0, 1, 'system prompt');

      expect(result).toBe('batch analysis result');
    });

    it('should call the model with the correct system and human messages', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'ok' });

      const batch = [makeSection('b.ts', 50)];
      await helper.processBatch(batch, 1, 3, 'my system prompt');

      expect(mockInvoke).toHaveBeenCalledWith([
        expect.objectContaining({ text: 'my system prompt' }),
        expect.objectContaining({ text: expect.stringContaining('Batch 2/3') }),
      ]);
    });

    it('should return an error string when the model throws', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('model error'));

      const batch = [makeSection('c.ts', 50)];
      const result = await helper.processBatch(batch, 0, 1, 'prompt');

      expect(result).toContain("Errore durante l'analisi del batch 1");
    });
  });

  describe('synthesizeReports', () => {
    it('should call the model even when there is only one report', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'synthesized single' });

      const result = await helper.synthesizeReports(
        ['solo report'],
        'synthesis prompt',
      );

      expect(result).toBe('synthesized single');
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });

    it('should call the model when there are multiple reports', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'synthesized' });

      const result = await helper.synthesizeReports(
        ['report 1', 'report 2'],
        'synthesis prompt',
      );

      expect(result).toBe('synthesized');
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });

    it('should pass all partial reports in the human message', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'ok' });

      await helper.synthesizeReports(['r1', 'r2'], 'prompt');

      const call = mockInvoke.mock.calls[0][0];
      const humanMsg = call[1].text as string;
      expect(humanMsg).toContain('=== Batch 1 ===');
      expect(humanMsg).toContain('=== Batch 2 ===');
    });

    it('should fall back to joining reports when the model throws', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('fail'));

      const result = await helper.synthesizeReports(
        ['part A', 'part B'],
        'prompt',
      );

      expect(result).toContain('part A');
      expect(result).toContain('part B');
    });
  });

  describe('analyzeReadme', () => {
    it('should return a warning string when README.md does not exist', async () => {
      (mockedFs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await helper.analyzeReadme('/repo');

      expect(result).toContain('README assente');
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('should call the model and return its content when README exists', async () => {
      (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
      (mockedFs.readFileSync as jest.Mock).mockReturnValue('# My Project');
      mockInvoke.mockResolvedValueOnce({ content: 'readme analysis' });

      const result = await helper.analyzeReadme('/repo');

      expect(result).toBe('readme analysis');
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });

    it('should include README content in the human message', async () => {
      (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
      (mockedFs.readFileSync as jest.Mock).mockReturnValue('# Title\nDesc');
      mockInvoke.mockResolvedValueOnce({ content: 'ok' });

      await helper.analyzeReadme('/repo');

      const humanMsg = mockInvoke.mock.calls[0][0][1].text as string;
      expect(humanMsg).toContain('# Title\nDesc');
    });

    it('should return an error string when the model throws', async () => {
      (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
      (mockedFs.readFileSync as jest.Mock).mockReturnValue('# Readme');
      mockInvoke.mockRejectedValueOnce(new Error('boom'));

      const result = await helper.analyzeReadme('/repo');

      expect(result).toContain("Errore durante l'analisi del README");
    });
  });

  describe('extractMark', () => {
    it('should extract an integer mark from model response', async () => {
      mockInvoke.mockResolvedValueOnce({ content: '7' });

      const mark = await helper.extractMark('readme report', 'comment report');

      expect(mark).toBe(7);
    });

    it('should extract a decimal mark from model response', async () => {
      mockInvoke.mockResolvedValueOnce({ content: '  6.5  ' });

      const mark = await helper.extractMark('r', 'c');

      expect(mark).toBe(6.5);
    });

    it('should return 0 when model response has no numeric value', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'no number here' });

      const mark = await helper.extractMark('r', 'c');

      expect(mark).toBe(0);
    });

    it('should return 0 when the model throws', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('fail'));

      const mark = await helper.extractMark('r', 'c');

      expect(mark).toBe(0);
    });

    it('should pass both reports in the human message', async () => {
      mockInvoke.mockResolvedValueOnce({ content: '8' });

      await helper.extractMark('my readme report', 'my comment report');

      const humanMsg = mockInvoke.mock.calls[0][0][1].text as string;
      expect(humanMsg).toContain('my readme report');
      expect(humanMsg).toContain('my comment report');
    });
  });

  describe('collectTextFiles', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const makeDirent = (name: string, isDir = false): fs.Dirent =>
      ({
        name,
        isDirectory: () => isDir,
        isFile: () => !isDir,
      }) as unknown as fs.Dirent;

    it('should collect files with allowed extensions', () => {
      (mockedFs.readdirSync as jest.Mock).mockReturnValueOnce([
        makeDirent('index.ts'),
        makeDirent('style.css'),
      ]);
      (mockedFs.statSync as jest.Mock).mockReturnValue({ size: 1024 });

      const files = helper.collectTextFiles(path.join(path.sep, 'repo'));

      expect(files).toContain(path.join(path.sep, 'repo', 'index.ts'));
      expect(files).toContain(path.join(path.sep, 'repo', 'style.css'));
    });

    it('should ignore files with non-allowed extensions', () => {
      (mockedFs.readdirSync as jest.Mock).mockReturnValueOnce([
        makeDirent('image.png'),
        makeDirent('data.csv'),
      ]);

      const files = helper.collectTextFiles(path.join(path.sep, 'repo'));

      expect(files).toHaveLength(0);
    });

    it('should skip ignored directories', () => {
      (mockedFs.readdirSync as jest.Mock).mockReturnValueOnce([
        makeDirent('node_modules', true),
        makeDirent('.git', true),
        makeDirent('src', true),
      ]);

      // src has one file
      (mockedFs.readdirSync as jest.Mock).mockReturnValueOnce([
        makeDirent('app.ts'),
      ]);
      (mockedFs.statSync as jest.Mock).mockReturnValue({ size: 500 });

      const files = helper.collectTextFiles(path.join(path.sep, 'repo'));

      expect(files).toEqual([path.join(path.sep, 'repo', 'src', 'app.ts')]);
    });

    it('should skip files exceeding the 100 KB size limit', () => {
      (mockedFs.readdirSync as jest.Mock).mockReturnValueOnce([
        makeDirent('huge.ts'),
      ]);
      (mockedFs.statSync as jest.Mock).mockReturnValue({
        size: 200 * 1024, // 200 KB — over the limit
      });

      const files = helper.collectTextFiles(path.join(path.sep, 'repo'));

      expect(files).toHaveLength(0);
    });

    it('should recurse into subdirectories', () => {
      (mockedFs.readdirSync as jest.Mock)
        .mockReturnValueOnce([makeDirent('src', true)])
        .mockReturnValueOnce([makeDirent('main.ts')]);

      (mockedFs.statSync as jest.Mock).mockReturnValue({ size: 1000 });

      const files = helper.collectTextFiles(path.join(path.sep, 'repo'));

      expect(files).toContain(path.join(path.sep, 'repo', 'src', 'main.ts'));
    });

    it('should return empty array when readdirSync throws', () => {
      (mockedFs.readdirSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('permission denied');
      });

      const files = helper.collectTextFiles(path.join(path.sep, 'repo'));

      expect(files).toHaveLength(0);
    });
  });

  describe('analyzeRepoDocumentation', () => {
    it('should return a DocsReport with readme, comments and mark', async () => {
      jest
        .spyOn(helper, 'analyzeReadme')
        .mockResolvedValueOnce('readme report');
      jest
        .spyOn(helper, 'analyzeCodeComments')
        .mockResolvedValueOnce('comment report');
      jest.spyOn(helper, 'extractMark').mockResolvedValueOnce(8.5);

      const report = await helper.analyzeRepoDocumentation('/repo', [
        '/repo/src/a.ts',
      ]);

      expect(report.readmeReport).toBe('readme report');
      expect(report.commentReport).toBe('comment report');
      expect(report.mark).toBe(8.5);
    });

    it('should run analyzeReadme and analyzeCodeComments in parallel', async () => {
      const calls: string[] = [];

      jest.spyOn(helper, 'analyzeReadme').mockImplementationOnce(async () => {
        calls.push('readme');
        return 'r';
      });
      jest
        .spyOn(helper, 'analyzeCodeComments')
        .mockImplementationOnce(async () => {
          calls.push('comments');
          return 'c';
        });
      jest.spyOn(helper, 'extractMark').mockResolvedValueOnce(7);

      await helper.analyzeRepoDocumentation('/repo', []);

      // Both should have been called (order may vary with Promise.all)
      expect(calls).toContain('readme');
      expect(calls).toContain('comments');
    });

    it('should pass readmeReport and commentReport to extractMark', async () => {
      jest.spyOn(helper, 'analyzeReadme').mockResolvedValueOnce('R');
      jest.spyOn(helper, 'analyzeCodeComments').mockResolvedValueOnce('C');
      const extractSpy = jest
        .spyOn(helper, 'extractMark')
        .mockResolvedValueOnce(5);

      await helper.analyzeRepoDocumentation('/repo', []);

      expect(extractSpy).toHaveBeenCalledWith('R', 'C');
    });
  });
});
