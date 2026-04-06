import { Injectable } from '@nestjs/common';
import { ChatBedrockConverse } from '@langchain/aws';

@Injectable()
export class SynthesizerNodeHelper {
  createModel() {
    return new ChatBedrockConverse({
      model: process.env.BEDROCK_MODEL_ID ?? 'deepseek.v3.2',
      region: process.env.BEDROCK_AWS_REGION ?? 'eu-north-1',
      temperature: 0,
      maxTokens: 5000,
    });
  }
}
