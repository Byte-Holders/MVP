import { validate } from 'class-validator';
import { CreateWorkspaceDto } from './CreateWorkspaceDto';

describe('CreateWorkspaceDto', () => {
  it('should pass validation with correct data', async () => {
    const dto = new CreateWorkspaceDto();
    dto.name = 'ValidName';
    
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if name is too short', async () => {
    const dto = new CreateWorkspaceDto();
    dto.name = 'A'; // MinLength è 2
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});