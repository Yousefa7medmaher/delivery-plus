import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictError, UnauthorizedError, generateCorrelationId } from '@food-delivery/shared';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { UserServiceClient } from '../common/user-service.client';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserRole } from '@food-delivery/shared';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly credentials: CredentialsRepository,
    private readonly userServiceClient: UserServiceClient,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, correlationId = generateCorrelationId()): Promise<AuthResponseDto> {
    const existing = await this.credentials.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(`Email ${dto.email} is already registered`);
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const role = dto.role ?? UserRole.CUSTOMER;

    const credential = await this.credentials.create({
      email: dto.email,
      passwordHash,
      role,
    });

    try {
      await this.userServiceClient.createProfile(
        {
          userId: credential.id,
          email: credential.email,
          fullName: dto.fullName,
          phone: dto.phone,
        },
        correlationId,
      );
    } catch (err) {
      // Compensate: remove the credential so we don't leave an orphaned
      // account with no profile (see UserServiceClient simplification note).
      await this.credentials.deleteById(credential.id);
      throw err;
    }

    return this.issueToken(credential.id, credential.email, credential.role);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const credential = await this.credentials.findByEmail(dto.email);
    if (!credential) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, credential.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return this.issueToken(credential.id, credential.email, credential.role);
  }

  private async issueToken(userId: string, email: string, role: UserRole): Promise<AuthResponseDto> {
    const accessToken = await this.jwtService.signAsync({ sub: userId, email, role });
    return { accessToken, userId, email, role };
  }
}
