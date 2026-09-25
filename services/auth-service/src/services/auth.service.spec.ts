import { AuthService } from './auth.service';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { UserServiceClient } from '../common/user-service.client';
import { JwtService } from '@nestjs/jwt';
import { UserRole, ConflictError, UnauthorizedError } from '@food-delivery/shared';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let credentials: jest.Mocked<CredentialsRepository>;
  let userServiceClient: jest.Mocked<UserServiceClient>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    credentials = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
    } as unknown as jest.Mocked<CredentialsRepository>;

    userServiceClient = {
      createProfile: jest.fn(),
    } as unknown as jest.Mocked<UserServiceClient>;

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
    } as unknown as jest.Mocked<JwtService>;

    service = new AuthService(credentials, userServiceClient, jwtService, {
      serviceName: 'auth-service',
      port: 3001,
      nodeEnv: 'test',
      databaseUrl: 'postgres://postgres:postgres@localhost:5432/auth_service',
      jwtSecret: 'secret',
      jwtExpiresIn: '1h',
      userServiceUrl: 'http://localhost:3002',
      internalAuthService: 'auth-service',
      internalAuthSecret: 'dev-secret',
      emailVerificationRequired: false,
      maxFailedLoginAttempts: 5,
      lockoutMinutes: 15,
      verificationTokenTtlMinutes: 60,
    });
  });

  describe('register', () => {
    it('throws ConflictError when email already exists', async () => {
      credentials.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        passwordHash: 'x',
        role: UserRole.CUSTOMER,
        emailVerified: true,
        failedLoginCount: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        service.register({ email: 'a@a.com', password: 'password123', fullName: 'A' }),
      ).rejects.toThrow(ConflictError);
    });

    it('creates credential, calls user-service, and returns a token', async () => {
      credentials.findByEmail.mockResolvedValue(null);
      credentials.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'b@b.com',
        passwordHash: 'hashed',
        role: UserRole.CUSTOMER,
        emailVerified: false,
        failedLoginCount: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
        verificationTokenHash: 'token-hash',
        verificationTokenExpiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      userServiceClient.createProfile.mockResolvedValue(undefined);

      const result = await service.register({
        email: 'b@b.com',
        password: 'password123',
        fullName: 'B',
      });

      expect(userServiceClient.createProfile).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'new-user-id', email: 'b@b.com', fullName: 'B' }),
        expect.any(String),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.userId).toBe('new-user-id');
    });

    it('rolls back the credential if user-service call fails', async () => {
      credentials.findByEmail.mockResolvedValue(null);
      credentials.create.mockResolvedValue({
        id: 'orphan-id',
        email: 'c@c.com',
        passwordHash: 'hashed',
        role: UserRole.CUSTOMER,
        emailVerified: false,
        failedLoginCount: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
        verificationTokenHash: 'token-hash',
        verificationTokenExpiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      userServiceClient.createProfile.mockRejectedValue(new Error('user-service down'));

      await expect(
        service.register({ email: 'c@c.com', password: 'password123', fullName: 'C' }),
      ).rejects.toThrow('user-service down');

      expect(credentials.deleteById).toHaveBeenCalledWith('orphan-id');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedError for unknown email', async () => {
      credentials.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nope@a.com', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError for wrong password', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      credentials.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'd@d.com',
        passwordHash: hash,
        role: UserRole.CUSTOMER,
        emailVerified: true,
        failedLoginCount: 0,
        lockedUntil: null,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        service.login({ email: 'd@d.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('returns a token for correct credentials and resets failure state', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      credentials.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'e@e.com',
        passwordHash: hash,
        role: UserRole.ADMIN,
        emailVerified: true,
        failedLoginCount: 3,
        lockedUntil: null,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      credentials.update.mockResolvedValue({} as any);

      const result = await service.login({ email: 'e@e.com', password: 'correct-password' });
      expect(credentials.update).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ failedLoginCount: 0, lockedUntil: null }),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('locks the account after the configured failed-attempt threshold', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      credentials.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'locked@example.com',
        passwordHash: hash,
        role: UserRole.CUSTOMER,
        emailVerified: true,
        failedLoginCount: 4,
        lockedUntil: null,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      credentials.update.mockResolvedValue({} as any);

      await expect(
        service.login({ email: 'locked@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedError);

      expect(credentials.update).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({
          failedLoginCount: expect.any(Number),
          lockedUntil: expect.any(Date),
        }),
      );
    });

    it('rejects login while the account is still locked', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      credentials.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'locked@example.com',
        passwordHash: hash,
        role: UserRole.CUSTOMER,
        emailVerified: true,
        failedLoginCount: 5,
        lockedUntil: new Date(Date.now() + 60_000),
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        service.login({ email: 'locked@example.com', password: 'correct-password' }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('email verification', () => {
    it('rejects expired or already-used verification tokens', async () => {
      credentials.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'verify@example.com',
        passwordHash: 'hash',
        role: UserRole.CUSTOMER,
        emailVerified: false,
        failedLoginCount: 0,
        lockedUntil: null,
        verificationTokenHash: 'used-hash',
        verificationTokenExpiresAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        service.verifyEmail({ email: 'verify@example.com', token: 'token-123' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('issues a safe resend-verification response for existing accounts', async () => {
      credentials.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'resend@example.com',
        passwordHash: 'hash',
        role: UserRole.CUSTOMER,
        emailVerified: false,
        failedLoginCount: 0,
        lockedUntil: null,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      credentials.update.mockResolvedValue({} as any);

      const result = await service.resendVerification({ email: 'resend@example.com' });

      expect(credentials.update).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({
          verificationTokenHash: expect.any(String),
          verificationTokenExpiresAt: expect.any(Date),
        }),
      );
      expect(result).toEqual({ message: 'If that account exists, a verification email has been sent' });
    });
  });
});
