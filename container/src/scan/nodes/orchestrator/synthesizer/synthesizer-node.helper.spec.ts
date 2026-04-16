import { Test, TestingModule } from '@nestjs/testing';
import { SynthesizerNodeHelper } from './synthesizer-node.helper';
import { ChatBedrockConverse } from '@langchain/aws';

jest.mock('@langchain/aws', () => ({
    ChatBedrockConverse: jest.fn().mockImplementation(() => ({ invoke: jest.fn() })),
}));

const mockChatBedrockConverse = ChatBedrockConverse as jest.Mock;

describe('SynthesizerNodeHelper', () => {
    let helper: SynthesizerNodeHelper;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [SynthesizerNodeHelper],
        }).compile();

        helper = module.get<SynthesizerNodeHelper>(SynthesizerNodeHelper);
    });

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
});