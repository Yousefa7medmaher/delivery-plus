import { DriverStatus, UserRole } from '@food-delivery/shared';

/**
 * Who can request each target status. ADMIN always allowed (checked in
 * service). BUSY is normally set by delivery-service when it assigns a
 * driver to a delivery — until delivery-service exists (Phase 7) only
 * ADMIN can force it, same pattern as order-service's TRANSITION_ROLES.
 */
export const TRANSITION_ROLES: Partial<Record<DriverStatus, UserRole[]>> = {
  [DriverStatus.AVAILABLE]: [UserRole.DRIVER, UserRole.ADMIN],
  [DriverStatus.OFFLINE]: [UserRole.DRIVER, UserRole.ADMIN],
  [DriverStatus.BUSY]: [UserRole.ADMIN], // normally: delivery-service (Phase 7/9)
  [DriverStatus.SUSPENDED]: [UserRole.ADMIN],
};

export function isRoleAllowedForTransition(target: DriverStatus, role: UserRole): boolean {
  if (role === UserRole.ADMIN) return true;
  return TRANSITION_ROLES[target]?.includes(role) ?? false;
}
