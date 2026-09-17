import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

/**
 * Mints a short-lived service-account JWT so delivery-service can call
 * order-service's and driver-service's status-transition endpoints as
 * itself, rather than requiring a real ADMIN user token for automated
 * dispatch actions.
 *
 * SIMPLIFICATION: same pattern/limitation as payment-service's
 * SystemTokenService — a stand-in for a proper service-identity/mTLS
 * scheme, to be replaced by Kafka-driven consumers in Phase 9.
 */
@Injectable()
export class SystemTokenService {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly jwtService: JwtService,
  ) {}

  async mint(): Promise<string> {
    const token = await this.jwtService.signAsync(
      { sub: 'system:delivery-service', email: 'delivery-service@internal', role: UserRole.ADMIN },
      { secret: this.config.jwtSecret, expiresIn: '5m' },
    );
    return `Bearer ${token}`;
  }
}
