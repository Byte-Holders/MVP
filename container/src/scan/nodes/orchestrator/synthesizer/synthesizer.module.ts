import { Module } from '@nestjs/common';
import { SynthesizerNodeHelper } from './synthesizer-node.helper';
import { SynthesizerNodeService } from './synthesizer-node.service';

@Module({
  providers: [SynthesizerNodeHelper, SynthesizerNodeService],
  exports: [SynthesizerNodeService],
})
export class SynthesizerModule {}
