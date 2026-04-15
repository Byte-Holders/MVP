import { Test, TestingModule } from '@nestjs/testing';
import { SecurityModule } from './security.module';
import {
    SECURITY_NODE_SERVICE_TOKEN,
    SecurityNodeService,
} from './security-node.service';
import { SecurityNodeHelper } from './security-node.helper';

describe('SecurityModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [SecurityModule],
        }).compile();
    });

    it('should compile the module successfully', () => {
        expect(module).toBeDefined();
    });

    it('should pass resolving SECURITY_NODE_SERVICE_TOKEN to an instance of SecurityNodeService', () => {
        const service = module.get<SecurityNodeService>(SECURITY_NODE_SERVICE_TOKEN);

        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(SecurityNodeService);
    });

    it('should pass resolving SecurityNodeHelper to its instance', () => {
        const helper = module.get<SecurityNodeHelper>(SecurityNodeHelper);

        expect(helper).toBeDefined();
        expect(helper).toBeInstanceOf(SecurityNodeHelper);
    });
});