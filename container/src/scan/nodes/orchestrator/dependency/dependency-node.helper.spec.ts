import { Test, TestingModule } from '@nestjs/testing';
import {
  DependencyNodeHelper,
  DependencyVulnerability,
} from './dependency-node.helper';
import * as execCliModule from '../../../exec.cli';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

jest.mock('../../../exec.cli', () => ({
  executeCli: jest.fn(),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  tmpdir: jest.fn().mockReturnValue('/tmp'),
}));

jest.mock('@langchain/aws', () => ({
  ChatBedrockConverse: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

const SBOM_RAW = JSON.stringify({
  artifacts: [
    { name: 'lodash', version: '4.17.21' },
    { name: 'express', version: '4.18.2' },
  ],
});

const GRYPE_RAW = JSON.stringify({
  matches: [
    {
      vulnerability: {
        id: 'CVE-2021-23337',
        severity: 'High',
        description: 'Command injection vulnerability',
        fix: { versions: ['4.17.21'], state: 'fixed' },
      },
      artifact: { name: 'lodash', version: '4.17.20' },
    },
    {
      vulnerability: {
        id: 'CVE-2022-00001',
        severity: 'Low',
        description: 'Minor issue',
        fix: { versions: [], state: 'not-fixed' },
      },
      artifact: { name: 'express', version: '4.18.1' },
    },
  ],
});

const MOCK_VULNERABILITIES: DependencyVulnerability[] = [
  {
    id: 'CVE-2021-23337',
    severity: 'High',
    description: 'Command injection vulnerability',
    packageName: 'lodash',
    packageVersion: '4.17.20',
    fixVersion: '4.17.21',
  },
  {
    id: 'CVE-2022-00001',
    severity: 'Low',
    description: 'Minor issue',
    packageName: 'express',
    packageVersion: '4.18.1',
    fixVersion: undefined,
  },
];

describe('DependencyNodeHelper', () => {
  let helper: DependencyNodeHelper;
  let mockInvoke: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    const { ChatBedrockConverse } = require('@langchain/aws');
    mockInvoke = jest.fn();
    (ChatBedrockConverse as jest.Mock).mockImplementation(() => ({
      invoke: mockInvoke,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [DependencyNodeHelper],
    }).compile();

    helper = module.get<DependencyNodeHelper>(DependencyNodeHelper);
  });

  describe('createModel', () => {
    it('should instantiate ChatBedrockConverse with default config', () => {
      const { ChatBedrockConverse } = require('@langchain/aws');
      helper.createModel();
      expect(ChatBedrockConverse).toHaveBeenCalledWith({
        model: 'deepseek.v3.2',
        region: 'eu-north-1',
        temperature: 0,
        maxTokens: 5000,
      });
    });

    it('should use env variables when defined', () => {
      process.env.BEDROCK_MODEL_ID = 'my-custom-model';
      process.env.BEDROCK_AWS_REGION = 'us-east-1';

      const { ChatBedrockConverse } = require('@langchain/aws');
      helper.createModel();

      expect(ChatBedrockConverse).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'my-custom-model',
          region: 'us-east-1',
        }),
      );

      delete process.env.BEDROCK_MODEL_ID;
      delete process.env.BEDROCK_AWS_REGION;
    });
  });

  describe('executeSyft', () => {
    it('should call executeCli with the correct syft command', async () => {
      (execCliModule.executeCli as jest.Mock).mockResolvedValue(
        Buffer.from(SBOM_RAW),
      );

      const result = await helper.executeSyft('/repo/path');

      expect(execCliModule.executeCli).toHaveBeenCalledWith({
        name: 'syft',
        args: ['dir:/repo/path', '-o', 'json', '-q'],
      });
      expect(result).toBe(SBOM_RAW);
    });

    it('should propagate errors thrown by executeCli', async () => {
      (execCliModule.executeCli as jest.Mock).mockRejectedValue(
        new Error('syft not found'),
      );

      await expect(helper.executeSyft('/repo/path')).rejects.toThrow(
        'syft not found',
      );
    });
  });

  describe('parseSbom', () => {
    it('should parse artifacts into DepsReportUnit list', () => {
      const result = helper.parseSbom(SBOM_RAW);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'lodash', version: '4.17.21' });
      expect(result[1]).toEqual({ name: 'express', version: '4.18.2' });
    });

    it('should return an empty list when artifacts is missing', () => {
      const raw = JSON.stringify({});
      const result = helper.parseSbom(raw);
      expect(result).toEqual([]);
    });

    it('should return an empty list when artifacts is empty', () => {
      const raw = JSON.stringify({ artifacts: [] });
      const result = helper.parseSbom(raw);
      expect(result).toEqual([]);
    });

    it('should throw on invalid JSON', () => {
      expect(() => helper.parseSbom('not-json')).toThrow();
    });
  });

  describe('executeGrype', () => {
    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (execCliModule.executeCli as jest.Mock).mockResolvedValue(
        Buffer.from(GRYPE_RAW),
      );
      (os.tmpdir as jest.Mock).mockReturnValue('/tmp');
      jest.spyOn(Date, 'now').mockReturnValue(12345);
    });

    it('should not call unlinkSync if temp file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (execCliModule.executeCli as jest.Mock).mockRejectedValue(
        new Error('fail'),
      );

      await expect(helper.executeGrype(SBOM_RAW)).rejects.toThrow('fail');
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('parseGrype', () => {
    it('should parse matches into DependencyVulnerability list', () => {
      const result = helper.parseGrype(GRYPE_RAW);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'CVE-2021-23337',
        severity: 'High',
        description: 'Command injection vulnerability',
        packageName: 'lodash',
        packageVersion: '4.17.20',
        fixVersion: '4.17.21',
      });
    });

    it('should set fixVersion to undefined when state is not "fixed"', () => {
      const result = helper.parseGrype(GRYPE_RAW);
      expect(result[1].fixVersion).toBeUndefined();
    });

    it('should return an empty list when matches is missing', () => {
      const raw = JSON.stringify({});
      expect(helper.parseGrype(raw)).toEqual([]);
    });

    it('should throw on invalid JSON', () => {
      expect(() => helper.parseGrype('not-json')).toThrow();
    });
  });

  describe('translateDescriptions', () => {
    it('should return the input unchanged when the list is empty', async () => {
      const result = await helper.translateDescriptions([]);
      expect(result).toEqual([]);
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('should return the input unchanged when no vulnerability has a description', async () => {
      const noDesc: DependencyVulnerability[] = [
        { ...MOCK_VULNERABILITIES[0], description: '' },
      ];
      const result = await helper.translateDescriptions(noDesc);
      expect(result).toEqual(noDesc);
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('should call the LLM and replace descriptions with translated ones', async () => {
      const translatedMap = {
        '0': 'Vulnerabilità di iniezione',
        '1': 'Problema minore',
      };
      mockInvoke.mockResolvedValue({ content: JSON.stringify(translatedMap) });

      const result = await helper.translateDescriptions(MOCK_VULNERABILITIES);

      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(result[0].description).toBe('Vulnerabilità di iniezione');
      expect(result[1].description).toBe('Problema minore');
    });

    it('should strip markdown fences from the LLM response', async () => {
      const translatedMap = { '0': 'Traduzione', '1': 'Altra traduzione' };
      mockInvoke.mockResolvedValue({
        content: '```json\n' + JSON.stringify(translatedMap) + '\n```',
      });

      const result = await helper.translateDescriptions(MOCK_VULNERABILITIES);
      expect(result[0].description).toBe('Traduzione');
    });

    it('should fall back to original descriptions when LLM throws', async () => {
      mockInvoke.mockRejectedValue(new Error('LLM error'));

      const result = await helper.translateDescriptions(MOCK_VULNERABILITIES);

      expect(result[0].description).toBe(MOCK_VULNERABILITIES[0].description);
      expect(result[1].description).toBe(MOCK_VULNERABILITIES[1].description);
    });

    it('should fall back to original description for missing keys in translation map', async () => {
      mockInvoke.mockResolvedValue({
        content: JSON.stringify({ '0': 'Solo prima' }),
      });

      const result = await helper.translateDescriptions(MOCK_VULNERABILITIES);

      expect(result[0].description).toBe('Solo prima');
      expect(result[1].description).toBe(MOCK_VULNERABILITIES[1].description);
    });
  });

  describe('analyzeDependencies', () => {
    const LIST = [{ name: 'lodash', version: '4.17.21' }];
    const LLM_RESPONSE = {
      libraries: [{ name: 'lodash', version: '4.17.21' }],
      frameworks: [{ name: 'nestjs', version: '10.0.0' }],
      vulnerabilityAnalysis: 'Nessuna vulnerabilità critica rilevata.',
    };

    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify({
          dependencies: { lodash: '^4.17.21', nestjs: '^10.0.0' },
        }),
      );
    });

    it('should read package.json and call the LLM', async () => {
      mockInvoke.mockResolvedValue({ content: JSON.stringify(LLM_RESPONSE) });

      const result = await helper.analyzeDependencies(
        '/repo',
        LIST,
        MOCK_VULNERABILITIES,
      );

      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.join('/repo', 'package.json'),
        'utf-8',
      );
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(result).toEqual(LLM_RESPONSE);
    });

    it('should strip markdown fences from the LLM response', async () => {
      mockInvoke.mockResolvedValue({
        content: '```json\n' + JSON.stringify(LLM_RESPONSE) + '\n```',
      });

      const result = await helper.analyzeDependencies(
        '/repo',
        LIST,
        MOCK_VULNERABILITIES,
      );
      expect(result.libraries).toEqual(LLM_RESPONSE.libraries);
    });

    it('should use empty string for package.json when the file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      mockInvoke.mockResolvedValue({ content: JSON.stringify(LLM_RESPONSE) });

      await helper.analyzeDependencies('/repo', LIST, MOCK_VULNERABILITIES);

      expect(fs.readFileSync).not.toHaveBeenCalled();
    });

    it('should return empty defaults when LLM throws', async () => {
      mockInvoke.mockRejectedValue(new Error('LLM failure'));

      const result = await helper.analyzeDependencies(
        '/repo',
        LIST,
        MOCK_VULNERABILITIES,
      );

      expect(result).toEqual({
        libraries: [],
        frameworks: [],
        vulnerabilityAnalysis: '',
      });
    });

    it('should return empty defaults when LLM returns invalid JSON', async () => {
      mockInvoke.mockResolvedValue({ content: 'not json' });

      const result = await helper.analyzeDependencies(
        '/repo',
        LIST,
        MOCK_VULNERABILITIES,
      );

      expect(result).toEqual({
        libraries: [],
        frameworks: [],
        vulnerabilityAnalysis: '',
      });
    });

    it('should guard against missing fields in the LLM JSON response', async () => {
      mockInvoke.mockResolvedValue({ content: JSON.stringify({}) });

      const result = await helper.analyzeDependencies(
        '/repo',
        LIST,
        MOCK_VULNERABILITIES,
      );

      expect(result.libraries).toEqual([]);
      expect(result.frameworks).toEqual([]);
      expect(result.vulnerabilityAnalysis).toBe('');
    });
  });
});
