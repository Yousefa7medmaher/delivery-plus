import { CartService } from './cart.service';
import { CartRepository } from '../repositories/cart.repository';
import { MenuServiceClient } from '../common/menu-service.client';
import { BadRequestError, ConflictError } from '@food-delivery/shared';
import { emptyCart } from '../entities/cart.model';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: jest.Mocked<CartRepository>;
  let menuServiceClient: jest.Mocked<MenuServiceClient>;

  beforeEach(() => {
    cartRepository = {
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      ping: jest.fn(),
    } as unknown as jest.Mocked<CartRepository>;

    menuServiceClient = {
      getItem: jest.fn(),
    } as unknown as jest.Mocked<MenuServiceClient>;

    service = new CartService(cartRepository, menuServiceClient);
  });

  describe('getCart', () => {
    it('returns an empty cart with total 0 when none exists', async () => {
      cartRepository.find.mockResolvedValue(null);
      const result = await service.getCart('user-1');
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('addItem', () => {
    it('rejects unavailable items', async () => {
      menuServiceClient.getItem.mockResolvedValue({
        id: 'item-1',
        restaurantId: 'rest-1',
        name: 'Burger',
        price: 9.99,
        available: false,
      });
      cartRepository.find.mockResolvedValue(null);

      await expect(
        service.addItem('user-1', { menuItemId: 'item-1', quantity: 1 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('adds a new item and computes the total', async () => {
      menuServiceClient.getItem.mockResolvedValue({
        id: 'item-1',
        restaurantId: 'rest-1',
        name: 'Burger',
        price: 9.99,
        available: true,
      });
      cartRepository.find.mockResolvedValue(null);
      cartRepository.save.mockResolvedValue(undefined);

      const result = await service.addItem('user-1', { menuItemId: 'item-1', quantity: 2 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(19.98);
      expect(result.restaurantId).toBe('rest-1');
    });

    it('increments quantity when the item already exists in the cart', async () => {
      menuServiceClient.getItem.mockResolvedValue({
        id: 'item-1',
        restaurantId: 'rest-1',
        name: 'Burger',
        price: 10,
        available: true,
      });
      cartRepository.find.mockResolvedValue({
        userId: 'user-1',
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'item-1', name: 'Burger', price: 10, quantity: 1 }],
        updatedAt: new Date().toISOString(),
      });

      const result = await service.addItem('user-1', { menuItemId: 'item-1', quantity: 1 });
      expect(result.items[0].quantity).toBe(2);
      expect(result.total).toBe(20);
    });

    it('rejects adding an item from a different restaurant than the existing cart', async () => {
      menuServiceClient.getItem.mockResolvedValue({
        id: 'item-2',
        restaurantId: 'rest-2',
        name: 'Pizza',
        price: 12,
        available: true,
      });
      cartRepository.find.mockResolvedValue({
        userId: 'user-1',
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'item-1', name: 'Burger', price: 10, quantity: 1 }],
        updatedAt: new Date().toISOString(),
      });

      await expect(
        service.addItem('user-1', { menuItemId: 'item-2', quantity: 1 }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('updateItemQuantity', () => {
    it('throws when the cart is empty', async () => {
      cartRepository.find.mockResolvedValue(null);
      await expect(
        service.updateItemQuantity('user-1', 'item-1', { quantity: 2 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('removes the item and clears the cart key when quantity is set to 0 and cart becomes empty', async () => {
      cartRepository.find.mockResolvedValue({
        userId: 'user-1',
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'item-1', name: 'Burger', price: 10, quantity: 1 }],
        updatedAt: new Date().toISOString(),
      });

      const result = await service.updateItemQuantity('user-1', 'item-1', { quantity: 0 });

      expect(cartRepository.delete).toHaveBeenCalledWith('user-1');
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('updates quantity in place', async () => {
      cartRepository.find.mockResolvedValue({
        userId: 'user-1',
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'item-1', name: 'Burger', price: 10, quantity: 1 }],
        updatedAt: new Date().toISOString(),
      });

      const result = await service.updateItemQuantity('user-1', 'item-1', { quantity: 5 });
      expect(result.items[0].quantity).toBe(5);
      expect(result.total).toBe(50);
    });
  });

  describe('clearCart', () => {
    it('deletes the cart key', async () => {
      await service.clearCart('user-1');
      expect(cartRepository.delete).toHaveBeenCalledWith('user-1');
    });
  });

  it('emptyCart helper returns a cart with null restaurantId and no items', () => {
    const cart = emptyCart('user-x');
    expect(cart.restaurantId).toBeNull();
    expect(cart.items).toHaveLength(0);
  });
});
