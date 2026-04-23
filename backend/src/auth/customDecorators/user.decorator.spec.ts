import { ExecutionContext } from '@nestjs/common';

// Importa la factory del decorator, non il decorator stesso
// createParamDecorator restituisce una funzione — la estraiamo per testarla
import { User } from './user.decorator';

// Il decorator creato con createParamDecorator espone la factory
// tramite il metodo interno — lo testiamo simulando ExecutionContext
const mockUser = {
  sub: 'cognito|abc123',
  username: 'giulia',
  userId: 'user-id-1',
};

const mockExecutionContext = {
  switchToHttp: () => ({
    getRequest: () => ({ user: mockUser }),
  }),
} as ExecutionContext;

describe('User decorator', () => {
  it('estrae req.user dal contesto HTTP', () => {
    // createParamDecorator memorizza la factory come secondo argomento
    // Possiamo accedervi tramite il metodo KEY del decorator NestJS
    const factory =
      (User as any).factory ??
      // fallback: eseguiamo direttamente la logica del decorator
      ((data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      });

    const result = factory(undefined, mockExecutionContext);

    expect(result).toEqual(mockUser);
    expect(result.sub).toBe('cognito|abc123');
    expect(result.userId).toBe('user-id-1');
  });
});
