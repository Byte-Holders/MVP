import { Test, TestingModule } from '@nestjs/testing';
import { SynthesizerModule } from './synthesizer.module';
import { SynthesizerNodeService } from './synthesizer-node.service';
import { SynthesizerNodeHelper } from './synthesizer-node.helper';

describe('SynthesizerModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [SynthesizerModule],
        }).compile();
    });

    it('should compile the module successfully', () => {
        expect(module).toBeDefined();
    });

    it('should pass resolving SynthesizerNodeService', () => {
        const service = module.get<SynthesizerNodeService>(SynthesizerNodeService);
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(SynthesizerNodeService);
    });

    it('should pass resolving SynthesizerNodeHelper', () => {
        const helper = module.get<SynthesizerNodeHelper>(SynthesizerNodeHelper);
        expect(helper).toBeDefined();
        expect(helper).toBeInstanceOf(SynthesizerNodeHelper);
    });
});