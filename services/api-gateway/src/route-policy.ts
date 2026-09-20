export function isBlockedInternalRoute(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  return normalizedPath === '/api/users/internal' || normalizedPath.startsWith('/api/users/internal/');
}