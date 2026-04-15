import { Test, TestingModule } from '@nestjs/testing';
import { DocsModule } from './docs.module';
import { DOCS_NODE_SERVICE_TOKEN, DocsNodeService } from './docs-node.service';
import { DocsNodeHelper } from './docs-node.helper';

describe('DocsModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [DocsModule],
        }).compile();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should resolve DOCS_NODE_SERVICE_TOKEN to an instance of DocsNodeService', () => {
        const service = module.get<DocsNodeService>(DOCS_NODE_SERVICE_TOKEN);
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(DocsNodeService);
    });

    it('should resolve DocsNodeHelper', () => {
        const helper = module.get<DocsNodeHelper>(DocsNodeHelper);
        expect(helper).toBeDefined();
        expect(helper).toBeInstanceOf(DocsNodeHelper);
    });
});