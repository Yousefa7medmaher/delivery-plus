export function isBlockedInternalRoute(path: string): boolean {
  return path === '/api/users/internal' || path.startsWith('/api/users/internal/');
}