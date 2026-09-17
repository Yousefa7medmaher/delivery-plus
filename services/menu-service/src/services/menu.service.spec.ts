import { MenuService } from './menu.service';
import { CategoriesRepository } from '../repositories/categories.repository';
import { MenuItemsRepository } from '../repositories/menu-items.repository';
import { RestaurantServiceClient } from '../common/restaurant-service.client';
import { BadRequestError, ForbiddenError, NotFoundError } from '@food-delivery/shared';

describe('MenuService', () => {
  let service: MenuService;
  let categories: jest.Mocked<CategoriesRepository>;
  let menuItems: jest.Mocked<MenuItemsRepository>;
  let restaurantClient: jest.Mocked<RestaurantServiceClient>;

  const item = {
    id: 'item-1',
    restaurantId: 'r1',
    categoryId: undefined,
    name: 'Burger',
    description: undefined,
    price: '9.99',
    imageUrl: undefined,
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    categories = {
      findById: jest.fn(),
      findByRestaurant: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<CategoriesRepository>;

    menuItems = {
      findById: jest.fn(),
      findByRestaurant: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<MenuItemsRepository>;

    restaurantClient = {
      assertOwnership: jest.fn(),
    } as unknown as jest.Mocked<RestaurantServiceClient>;

    service = new MenuService(categories, menuItems, restaurantClient, { getOrSet: async (k: any, fn: any) => fn(), del: jest.fn() } as any);
  });

  describe('createItem', () => {
    it('rejects when caller does not own the restaurant', async () => {
      restaurantClient.assertOwnership.mockRejectedValue(
        new ForbiddenError('You do not own this restaurant'),
      );

      await expect(
        service.createItem('not-owner', {
          restaurantId: 'r1',
          name: 'Burger',
          price: 9.99,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it('rejects when categoryId belongs to a different restaurant', async () => {
      restaurantClient.assertOwnership.mockResolvedValue(undefined);
      categories.findById.mockResolvedValue({
        id: 'cat-1',
        restaurantId: 'other-restaurant',
        name: 'Mains',
        displayOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.createItem('owner-1', {
          restaurantId: 'r1',
          categoryId: 'cat-1',
          name: 'Burger',
          price: 9.99,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('creates the item when ownership and category are valid', async () => {
      restaurantClient.assertOwnership.mockResolvedValue(undefined);
      menuItems.create.mockResolvedValue(item);

      const result = await service.createItem('owner-1', {
        restaurantId: 'r1',
        name: 'Burger',
        price: 9.99,
      });

      expect(result.name).toBe('Burger');
      expect(menuItems.create).toHaveBeenCalledWith(
        expect.objectContaining({ restaurantId: 'r1', name: 'Burger', price: 9.99 }),
      );
    });
  });

  describe('getItem', () => {
    it('throws NotFoundError when missing', async () => {
      menuItems.findById.mockResolvedValue(null);
      await expect(service.getItem('missing')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateAvailability', () => {
    it('checks ownership via the item restaurantId before updating', async () => {
      menuItems.findById.mockResolvedValue(item);
      restaurantClient.assertOwnership.mockResolvedValue(undefined);
      menuItems.update.mockResolvedValue({ ...item, available: false });

      const result = await service.updateAvailability('item-1', 'owner-1', { available: false });

      expect(restaurantClient.assertOwnership).toHaveBeenCalledWith('r1', 'owner-1');
      expect(result.available).toBe(false);
    });
  });

  describe('deleteItem', () => {
    it('deletes only after ownership passes', async () => {
      menuItems.findById.mockResolvedValue(item);
      restaurantClient.assertOwnership.mockResolvedValue(undefined);

      await service.deleteItem('item-1', 'owner-1');

      expect(menuItems.delete).toHaveBeenCalledWith('item-1');
    });
  });

  describe('getMenu', () => {
    it('returns categories and items together', async () => {
      categories.findByRestaurant.mockResolvedValue([]);
      menuItems.findByRestaurant.mockResolvedValue([item]);

      const result = await service.getMenu('r1');
      expect(result.restaurantId).toBe('r1');
      expect(result.items).toHaveLength(1);
    });
  });
});
