import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

/**
 * Mints a short-lived service-account JWT so payment-service can call
 * order-service's status-transition endpoint as itself, rather than forcing
 * every caller to have an admin token.
 *
 * SIMPLIFICATION: order-service currently only recognizes real user roles
 * (see order-service TRANSITION_ROLES, which gates PAYMENT_PENDING/
 * CONFIRMED/FAILED behind ADMIN). Using an ADMIN-scoped service token here
 * is a stand-in for a proper service-identity/mTLS scheme, and will be
 * replaced once these transitions are driven by Kafka events (Phase 9),
 * which need no HTTP calls or tokens at all.
 */
@Injectable()
export class SystemTokenService {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly jwtService: JwtService,
  ) {}

  async mint(): Promise<string> {
    const token = await this.jwtService.signAsync(
      { sub: 'system:payment-service', email: 'payment-service@internal', role: UserRole.ADMIN },
      { secret: this.config.jwtSecret, expiresIn: '5m' },
    );
    return `Bearer ${token}`;
  }
}
