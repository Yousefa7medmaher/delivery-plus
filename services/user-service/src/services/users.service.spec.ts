import { UsersService } from './users.service';
import { ProfilesRepository } from '../repositories/profiles.repository';
import { OrderServiceClient } from '../common/order-service.client';
import { ConflictError, NotFoundError } from '@food-delivery/shared';

describe('UsersService', () => {
  let service: UsersService;
  let profiles: jest.Mocked<ProfilesRepository>;
  let orderServiceClient: jest.Mocked<OrderServiceClient>;

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
    it('throws ConflictError if profile already exists', async () => {
      profiles.findById.mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        fullName: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.createProfile({ userId: 'u1', email: 'a@a.com', fullName: 'A' }),
      ).rejects.toThrow(ConflictError);
    });

    it('creates a new profile', async () => {
      profiles.findById.mockResolvedValue(null);
      profiles.create.mockResolvedValue({
        id: 'u2',
        email: 'b@b.com',
        fullName: 'B',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createProfile({ userId: 'u2', email: 'b@b.com', fullName: 'B' });
      expect(result.id).toBe('u2');
      expect(profiles.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'u2', email: 'b@b.com', fullName: 'B' }),
      );
    });
  });

  describe('getProfile', () => {
    it('throws NotFoundError when profile is missing', async () => {
      profiles.findById.mockResolvedValue(null);
      await expect(service.getProfile('missing')).rejects.toThrow(NotFoundError);
    });

    it('returns the profile when found', async () => {
      profiles.findById.mockResolvedValue({
        id: 'u3',
        email: 'c@c.com',
        fullName: 'C',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const result = await service.getProfile('u3');
      expect(result.email).toBe('c@c.com');
    });
  });

  describe('updateProfile', () => {
    it('throws NotFoundError when updating a missing profile', async () => {
      profiles.findById.mockResolvedValue(null);
      await expect(service.updateProfile('missing', { fullName: 'X' })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('updates and returns the profile', async () => {
      profiles.findById.mockResolvedValue({
        id: 'u4',
        email: 'd@d.com',
        fullName: 'Old Name',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      profiles.update.mockResolvedValue({
        id: 'u4',
        email: 'd@d.com',
        fullName: 'New Name',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.updateProfile('u4', { fullName: 'New Name' });
      expect(result.fullName).toBe('New Name');
    });
  });
});
