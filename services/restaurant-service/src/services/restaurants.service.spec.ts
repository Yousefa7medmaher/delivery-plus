import { RestaurantsService } from './restaurants.service';
import { RestaurantsRepository } from '../repositories/restaurants.repository';
import { RestaurantStatus, UserRole, ForbiddenError, NotFoundError } from '@food-delivery/shared';

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let repo: jest.Mocked<RestaurantsRepository>;

  const baseRestaurant = {
    id: 'r1',
    ownerId: 'owner-1',
    name: 'Pizza Place',
    description: undefined,
    address: '123 Main St',
    status: RestaurantStatus.CLOSED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
      findOpenById: jest.fn(),
    } as unknown as jest.Mocked<RestaurantsRepository>;

    service = new RestaurantsService(repo, { getOrSet: async (k: any, fn: any) => fn(), del: jest.fn() } as any);
  });

  it('getById throws NotFoundError when missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toThrow(NotFoundError);
  });

  it('update throws ForbiddenError when requester is not the owner', async () => {
    repo.findById.mockResolvedValue(baseRestaurant);
    await expect(service.update('r1', 'someone-else', { name: 'New' })).rejects.toThrow(
      ForbiddenError,
    );
  });

  it('update succeeds for the owner', async () => {
    repo.findById.mockResolvedValue(baseRestaurant);
    repo.update.mockResolvedValue({ ...baseRestaurant, name: 'New Name' });

    const result = await service.update('r1', 'owner-1', { name: 'New Name' });
    expect(result.name).toBe('New Name');
  });

  it('updateStatus allows the owner to change status', async () => {
    repo.findById.mockResolvedValue(baseRestaurant);
    repo.update.mockResolvedValue({ ...baseRestaurant, status: RestaurantStatus.OPEN });

    const result = await service.updateStatus('r1', 'owner-1', UserRole.RESTAURANT_OWNER, {
      status: RestaurantStatus.OPEN,
    });
    expect(result.status).toBe(RestaurantStatus.OPEN);
  });

  it('updateStatus allows ADMIN to bypass ownership', async () => {
    repo.findById.mockResolvedValue(baseRestaurant);
    repo.update.mockResolvedValue({ ...baseRestaurant, status: RestaurantStatus.SUSPENDED });

    const result = await service.updateStatus('r1', 'admin-1', UserRole.ADMIN, {
      status: RestaurantStatus.SUSPENDED,
    });
    expect(result.status).toBe(RestaurantStatus.SUSPENDED);
  });

  it('updateStatus rejects a non-owner, non-admin', async () => {
    repo.findById.mockResolvedValue(baseRestaurant);
    await expect(
      service.updateStatus('r1', 'random-user', UserRole.CUSTOMER, {
        status: RestaurantStatus.OPEN,
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('list returns a paginated result', async () => {
    repo.list.mockResolvedValue([[baseRestaurant], 1]);
    const result = await service.list({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'DESC' });
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.totalPages).toBe(1);
  });
});
