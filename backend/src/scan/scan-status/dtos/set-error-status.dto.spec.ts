import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SetErrorStatusDto } from './set-error-status.dto';

const mockSetErrorStatusDto = (): object => ({ token: 'myToken' });

describe('UpdateScanStatusFromContainerDto', () => {
  it('should pass with a string token', async () => {
    const dto = plainToInstance(SetErrorStatusDto, mockSetErrorStatusDto);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'token')).toBe(false);
  });

  it('should fail if the token is missing', async () => {
    const dto = plainToInstance(SetErrorStatusDto, {
      ...mockSetErrorStatusDto(),
      token: undefined,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'token')).toBe(true);
  });

  it('should fail if the token is null', async () => {
    const dto = plainToInstance(SetErrorStatusDto, {
      ...mockSetErrorStatusDto(),
      token: null,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'token')).toBe(true);
  });

  it('should fail if the token is empty', async () => {
    const dto = plainToInstance(SetErrorStatusDto, {
      ...mockSetErrorStatusDto(),
      token: '',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'token')).toBe(true);
  });

  it('should fail if the token is not a string', async () => {
    const dto = plainToInstance(SetErrorStatusDto, {
      ...mockSetErrorStatusDto(),
      token: 123,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'token')).toBe(true);
  });
});
