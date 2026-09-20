import { isBlockedInternalRoute } from './route-policy';

describe('gateway internal route exposure', () => {
  it('blocks the internal users route from public proxying', () => {
    expect(isBlockedInternalRoute('/api/users/internal')).toBe(true);
    expect(isBlockedInternalRoute('/api/users/internal/anything')).toBe(true);
  });

  it('does not block normal user routes', () => {
    expect(isBlockedInternalRoute('/api/users/me')).toBe(false);
    expect(isBlockedInternalRoute('/api/users')).toBe(false);
  });
});