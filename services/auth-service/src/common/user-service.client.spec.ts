import { UserServiceClient } from './user-service.client';
import { signInternalRequest } from '@food-delivery/shared';

describe('UserServiceClient', () => {
  it('signs profile creation requests with the internal auth contract', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as any;
    const client = new UserServiceClient({
      userServiceUrl: 'http://user-service:3002',
      internalAuthService: 'auth-service',
      internalAuthSecret: 'test-secret',
    } as any);
    const payload = {
      userId: 'user-1',
      email: 'user@example.com',
      fullName: 'Test User',
    };

    await client.createProfile(payload, 'correlation-1');

    const [, request] = fetchMock.mock.calls[0];
    const headers = request.headers as Record<string, string>;
    expect(headers['x-internal-service']).toBe('auth-service');
    expect(
      headers['x-internal-signature'],
    ).toBeDefined();
    expect(
      headers['x-internal-signature'],
    ).toBe(
      signInternalRequest({
        method: 'POST',
        path: '/internal/users',
        timestamp: headers['x-internal-timestamp'],
        nonce: headers['x-internal-nonce'],
        body: payload,
        service: 'auth-service',
        secret: 'test-secret',
      }),
    );
  });
});