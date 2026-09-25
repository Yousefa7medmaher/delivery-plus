import { ExecutionContext } from '@nestjs/common';
import { InternalAuthGuard } from './internal-auth.guard';
import { signInternalRequest } from '@food-delivery/shared';

describe('InternalAuthGuard', () => {
  const config = {
    internalAuthSecret: 'test-secret',
    internalAuthAllowedService: 'auth-service',
  } as any;
  const redis = { set: jest.fn() };
  let guard: InternalAuthGuard;

  beforeEach(() => {
    redis.set.mockReset().mockResolvedValue('OK');
    guard = new InternalAuthGuard(config, redis as any);
  });

  function contextFor(request: Record<string, any>): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
  }

  function signedRequest(overrides: Record<string, any> = {}) {
    const request: any = {
      method: 'POST',
      path: '/internal/users',
      body: { userId: 'user-1', email: 'user@example.com' },
      ...overrides,
      headers: {
        'x-internal-service': 'auth-service',
        'x-internal-timestamp': Math.floor(Date.now() / 1000).toString(),
        'x-internal-nonce': 'nonce-1',
        ...(overrides.headers ?? {}),
      },
    };
    request.headers['x-internal-signature'] = signInternalRequest({
      method: request.method,
      path: request.path,
      timestamp: request.headers['x-internal-timestamp'],
      nonce: request.headers['x-internal-nonce'],
      body: request.body,
      service: request.headers['x-internal-service'],
      secret: config.internalAuthSecret,
    });
    return request;
  }

  it('accepts a valid auth-service request, records its nonce, and attaches the service identity', async () => {
    const request = signedRequest();
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.internalService).toBe('auth-service');
    expect(redis.set).toHaveBeenCalledWith(
      'internal-auth:nonce:auth-service:nonce-1',
      '1',
      'EX',
      600,
      'NX',
    );
  });

  it.each([
    ['a forged service', { headers: { 'x-internal-service': 'billing-service' } }],
    ['an expired timestamp', { headers: { 'x-internal-timestamp': '1' } }],
  ])('rejects %s', async (_name, overrides) => {
    await expect(guard.canActivate(contextFor(signedRequest(overrides)))).rejects.toThrow();
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('rejects a body changed after signing', async () => {
    const request = signedRequest();
    request.body = { userId: 'attacker' };
    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      'Invalid internal service signature',
    );
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('rejects a replayed nonce', async () => {
    redis.set.mockResolvedValue(null);
    await expect(guard.canActivate(contextFor(signedRequest()))).rejects.toThrow(
      'Replayed internal service request',
    );
  });
});