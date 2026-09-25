import { isBlockedInternalRoute } from './route-policy';
import { getServicePrefix, rewriteProxyPath } from './main';

describe('gateway internal route exposure', () => {
  it('blocks the internal users route from public proxying', () => {
    expect(isBlockedInternalRoute('/api/users/internal')).toBe(true);
    expect(isBlockedInternalRoute('/api/users/internal/profile')).toBe(true);
    expect(isBlockedInternalRoute('/api/users/Internal')).toBe(true);
    expect(isBlockedInternalRoute('/api/users/INTERNAL/users')).toBe(true);
    expect(isBlockedInternalRoute('/internal/users')).toBe(true);
  });

  it('does not block normal user routes', () => {
    expect(isBlockedInternalRoute('/api/users/me')).toBe(false);
    expect(isBlockedInternalRoute('/api/users')).toBe(false);
  });

  it('rewrites public auth routes to the downstream service route', () => {
    expect(rewriteProxyPath('/api/auth', '/register')).toBe('/auth/register');
    expect(rewriteProxyPath('/api/auth', '/login')).toBe('/auth/login');
    expect(rewriteProxyPath('/api/auth', '/verify-email')).toBe('/auth/verify-email');
    expect(rewriteProxyPath('/api/auth', '/me')).toBe('/auth/me');
  });

  it('rewrites user routes without double-prefixing', () => {
    expect(getServicePrefix('/api/users')).toBe('/users');
    expect(rewriteProxyPath('/api/users', '/me')).toBe('/users/me');
    expect(rewriteProxyPath('/api/users', '/123')).toBe('/users/123');
  });

  it('preserves menu-service root routes and swagger-json rewrite behavior', () => {
    expect(getServicePrefix('/api/menus')).toBe('');
    expect(rewriteProxyPath('/api/menus', '/restaurants/abc/menu')).toBe('/restaurants/abc/menu');
    expect(rewriteProxyPath('/api/menus', '/docs-json')).toBe('/docs-json');
    expect(rewriteProxyPath('/api/auth', '/docs-json')).toBe('/docs-json');
    expect(rewriteProxyPath('/api/auth', '/docs-json?cache=1')).toBe('/docs-json?cache=1');
    expect(rewriteProxyPath('/api/auth', '/docs-json/subpath')).toBe('/docs-json');
    expect(rewriteProxyPath('/api/auth', '/docs-json/subpath?cache=1')).toBe('/docs-json?cache=1');
  });
});