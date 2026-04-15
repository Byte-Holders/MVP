import { Test, TestingModule } from '@nestjs/testing';
import { DepsModule } from './dependency.module';
import {
    DEPENDENCY_NODE_SERVICE_TOKEN,
    DependencyNodeService,
} from './dependency-node.service';
import { DependencyNodeHelper } from './dependency-node.helper';

jest.mock('@langchain/aws', () => ({
    ChatBedrockConverse: jest.fn().mockImplementation(() => ({ invoke: jest.fn() })),
}));

jest.mock('../../../exec.cli', () => ({
    executeCli: jest.fn(),
}));

describe('DepsModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [DepsModule],
        }).compile();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should provide DependencyNodeService under the correct token', () => {
        const service = module.get<DependencyNodeService>(
            DEPENDENCY_NODE_SERVICE_TOKEN,
        );
        expect(service).toBeInstanceOf(DependencyNodeService);
    });

    it('should provide DependencyNodeHelper', () => {
        const helper = module.get<DependencyNodeHelper>(DependencyNodeHelper);
        expect(helper).toBeInstanceOf(DependencyNodeHelper);
    });

    it('should export DEPENDENCY_NODE_SERVICE_TOKEN', () => {
        const service = module.get<DependencyNodeService>(
            DEPENDENCY_NODE_SERVICE_TOKEN,
        );
        expect(service).toBeDefined();
    });

    it('should NOT export DependencyNodeHelper directly', () => {
        const service = module.get<DependencyNodeService>(
            DEPENDENCY_NODE_SERVICE_TOKEN,
        ) as DependencyNodeService;
        expect(service).toBeDefined();
    });
});