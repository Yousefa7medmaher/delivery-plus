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
      deleteById: jest.fn(),
    } as unknown as jest.Mocked<CredentialsRepository>;

    userServiceClient = {
      createProfile: jest.fn(),
    } as unknown as jest.Mocked<UserServiceClient>;

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
    } as unknown as jest.Mocked<JwtService>;

    service = new AuthService(credentials, userServiceClient, jwtService);
  });

  describe('register', () => {
    it('throws ConflictError when email already exists', async () => {
      credentials.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        passwordHash: 'x',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userServiceClient.createProfile.mockResolvedValue(undefined);

      const result = await service.register({
        email: 'b@b.com',
        password: 'password123',
        fullName: 'B',
      });

      expect(userServiceClient.createProfile).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'new-user-id', email: 'b@b.com' }),
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.login({ email: 'd@d.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('returns a token for correct credentials', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      credentials.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'e@e.com',
        passwordHash: hash,
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.login({ email: 'e@e.com', password: 'correct-password' });
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });
});
