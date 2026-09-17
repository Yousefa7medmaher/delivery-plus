import { OrderStatus, UserRole } from '@food-delivery/shared';

/**
 * Who is allowed to request each *target* status, before ownership is even
 * checked. ADMIN can always do everything (checked separately in the
 * service). This is intentionally conservative for statuses that will
 * eventually be system-triggered by payment-service, driver-service, and
 * delivery-service once those exist (Phases 5–7): until then only ADMIN can
 * set them, so the transition endpoint stays usable for local testing
 * without pretending those integrations already exist.
 */
export const TRANSITION_ROLES: Partial<Record<OrderStatus, UserRole[]>> = {
  [OrderStatus.PAYMENT_PENDING]: [UserRole.ADMIN], // normally: order-service itself, right after creation
  [OrderStatus.CONFIRMED]: [UserRole.ADMIN], // normally: payment-service, on payment.completed (Phase 5/9)
  [OrderStatus.PREPARING]: [UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  [OrderStatus.READY_FOR_PICKUP]: [UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  [OrderStatus.DRIVER_ASSIGNED]: [UserRole.ADMIN], // normally: delivery-service (Phase 7/9)
  [OrderStatus.PICKED_UP]: [UserRole.ADMIN], // normally: delivery-service (Phase 7/9)
  [OrderStatus.DELIVERED]: [UserRole.ADMIN], // normally: delivery-service (Phase 7/9)
  [OrderStatus.CANCELLED]: [UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  [OrderStatus.FAILED]: [UserRole.ADMIN],
};

export function isRoleAllowedForTransition(target: OrderStatus, role: UserRole): boolean {
  if (role === UserRole.ADMIN) return true;
  return TRANSITION_ROLES[target]?.includes(role) ?? false;
}
