import { UsersService } from './users.service';
import { ProfilesRepository } from '../repositories/profiles.repository';
import { OrderServiceClient } from '../common/order-service.client';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, UserRole } from '@food-delivery/shared';
import { UserProfile } from '../entities/user-profile.entity';

describe('UsersService', () => {
  let service: UsersService;
  let profiles: jest.Mocked<ProfilesRepository>;
  let orderServiceClient: jest.Mocked<OrderServiceClient>;

  const owner = {
    sub: 'u-owner',
    email: 'owner@example.com',
    role: UserRole.CUSTOMER,
  };
  const otherUser = {
    sub: 'u-other',
    email: 'other@example.com',
    role: UserRole.CUSTOMER,
  };
  const admin = {
    sub: 'u-admin',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  function profile(overrides: Partial<UserProfile> = {}): UserProfile {
    return {
      id: 'u-owner',
      authCredentialId: 'u-owner',
      createdByService: 'auth-service',
      email: 'owner@example.com',
      fullName: 'Owner',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  beforeEach(() => {
    profiles = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ProfilesRepository>;

    orderServiceClient = {
      getOrderHistory: jest.fn(),
    } as unknown as jest.Mocked<OrderServiceClient>;

    service = new UsersService(profiles, orderServiceClient);
  });

  describe('createProfile', () => {
    it('rejects creation without a trusted service identity', async () => {
      await expect(
        service.createProfile(
          { userId: 'u1', authCredentialId: 'u1', email: 'a@a.com', fullName: 'A' },
          '',
        ),
      ).rejects.toThrow(UnauthorizedError);
      expect(profiles.create).not.toHaveBeenCalled();
    });

    it('rejects auth/profile id mismatch', async () => {
      await expect(
        service.createProfile(
          { userId: 'u1', authCredentialId: 'u2', email: 'a@a.com', fullName: 'A' },
          'auth-service',
        ),
      ).rejects.toThrow(ConflictError);
      expect(profiles.create).not.toHaveBeenCalled();
    });

    it('throws ConflictError if profile already exists', async () => {
      profiles.findById.mockResolvedValue(profile({ id: 'u1', authCredentialId: 'u1' }));

      await expect(
        service.createProfile(
          { userId: 'u1', authCredentialId: 'u1', email: 'a@a.com', fullName: 'A' },
          'auth-service',
        ),
      ).rejects.toThrow(ConflictError);
    });

    it('creates a profile owned by the verified internal caller', async () => {
      profiles.findById.mockResolvedValue(null);
      profiles.create.mockResolvedValue(profile({ id: 'u2', authCredentialId: 'u2', email: 'b@b.com', fullName: 'B' }));

      const result = await service.createProfile(
        { userId: 'u2', authCredentialId: 'u2', email: 'b@b.com', fullName: 'B' },
        'auth-service',
      );
      expect(result.id).toBe('u2');
      expect(profiles.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'u2',
          authCredentialId: 'u2',
          createdByService: 'auth-service',
          email: 'b@b.com',
          fullName: 'B',
        }),
      );
    });
  });

  describe('getOwnProfile', () => {
    it('returns the caller profile when identity mapping matches', async () => {
      profiles.findById.mockResolvedValue(profile());
      const result = await service.getOwnProfile(owner);
      expect(result.id).toBe('u-owner');
    });

    it('throws NotFoundError when the caller has no profile', async () => {
      profiles.findById.mockResolvedValue(null);
      await expect(service.getOwnProfile(owner)).rejects.toThrow(NotFoundError);
    });

    it('rejects when JWT email does not match the stored profile', async () => {
      profiles.findById.mockResolvedValue(profile());
      await expect(service.getOwnProfile({ ...owner, email: 'other@example.com' })).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe('getProfileById', () => {
    it('allows a user to read their own profile', async () => {
      profiles.findById.mockResolvedValue(profile());
      const result = await service.getProfileById('u-owner', owner);
      expect(result.email).toBe('owner@example.com');
    });

    it('forbids a different user from reading another profile', async () => {
      profiles.findById.mockResolvedValue(profile());
      await expect(service.getProfileById('u-owner', otherUser)).rejects.toThrow(ForbiddenError);
    });

    it('allows an admin to read another profile', async () => {
      profiles.findById.mockResolvedValue(profile());
      const result = await service.getProfileById('u-owner', admin);
      expect(result.id).toBe('u-owner');
    });

    it('rejects stored credential mapping drift', async () => {
      profiles.findById.mockResolvedValue(profile({ authCredentialId: 'drifted-id' }));
      await expect(service.getProfileById('u-owner', owner)).rejects.toThrow(ConflictError);
    });
  });

  describe('updateOwnProfile', () => {
    it('throws NotFoundError when updating a missing profile', async () => {
      profiles.findById.mockResolvedValue(null);
      await expect(service.updateOwnProfile(owner, { fullName: 'X' })).rejects.toThrow(NotFoundError);
    });

    it('updates and returns the caller profile', async () => {
      profiles.findById.mockResolvedValue(profile());
      profiles.update.mockResolvedValue(profile({ fullName: 'New Name' }));

      const result = await service.updateOwnProfile(owner, { fullName: 'New Name' });
      expect(result.fullName).toBe('New Name');
      expect(profiles.update).toHaveBeenCalledWith('u-owner', { fullName: 'New Name' });
    });

    it('does not update when auth/profile emails diverge', async () => {
      profiles.findById.mockResolvedValue(profile());
      await expect(
        service.updateOwnProfile({ ...owner, email: 'spoofed@example.com' }, { fullName: 'Hacker' }),
      ).rejects.toThrow(ConflictError);
      expect(profiles.update).not.toHaveBeenCalled();
    });
  });

  describe('getOrderHistory', () => {
    it('proxies order history after confirming the caller owns a consistent profile', async () => {
      profiles.findById.mockResolvedValue(profile());
      orderServiceClient.getOrderHistory.mockResolvedValue({ items: [] });

      const result = await service.getOrderHistory(owner, 'Bearer token', 1, 20);
      expect(result).toEqual({ items: [] });
      expect(orderServiceClient.getOrderHistory).toHaveBeenCalledWith('Bearer token', 1, 20);
    });

    it('rejects order history without the caller authorization header', async () => {
      await expect(service.getOrderHistory(owner, '', 1, 20)).rejects.toThrow(UnauthorizedError);
      expect(orderServiceClient.getOrderHistory).not.toHaveBeenCalled();
    });
  });
});
