import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { INTERNAL_AUTH_HEADERS, signInternalRequest } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

export interface CreateProfilePayload {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
}

/**
 * Synchronous internal HTTP call to user-service.
 *
 * SIMPLIFICATION: Until Kafka is introduced (Phase 9), auth-service and
 * user-service are kept consistent via a direct synchronous call instead of
 * an async `user.created` event + saga/compensation. If this call fails,
 * registration is rolled back (see AuthService.register). This will be
 * replaced by an idempotent event-driven flow in the Kafka phase.
 */
@Injectable()
export class UserServiceClient {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async createProfile(payload: CreateProfilePayload, correlationId: string): Promise<void> {
    const path = '/internal/users';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = randomUUID();
    const signature = signInternalRequest({
      method: 'POST',
      path,
      timestamp,
      nonce,
      body: payload,
      service: this.config.internalAuthService,
      secret: this.config.internalAuthSecret,
    });
    const response = await fetch(`${this.config.userServiceUrl}/internal/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
        [INTERNAL_AUTH_HEADERS.service]: this.config.internalAuthService,
        [INTERNAL_AUTH_HEADERS.timestamp]: timestamp,
        [INTERNAL_AUTH_HEADERS.nonce]: nonce,
        [INTERNAL_AUTH_HEADERS.signature]: signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        `Failed to create user profile (status ${response.status})`,
      );
    }
  }
}
