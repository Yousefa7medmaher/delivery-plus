import { Injectable } from '@nestjs/common';
import { BadRequestError, ConflictError } from '@food-delivery/shared';
import { CartRepository } from '../repositories/cart.repository';
import { MenuServiceClient } from '../common/menu-service.client';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { Cart, CartWithTotal, emptyCart, withTotal } from '../entities/cart.model';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly menuServiceClient: MenuServiceClient,
  ) {}

  async getCart(userId: string): Promise<CartWithTotal> {
    const cart = (await this.cartRepository.find(userId)) ?? emptyCart(userId);
    return withTotal(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartWithTotal> {
    const item = await this.menuServiceClient.getItem(dto.menuItemId);

    if (!item.available) {
      throw new BadRequestError(`Menu item ${item.name} is not currently available`);
    }

    let cart = (await this.cartRepository.find(userId)) ?? emptyCart(userId);

    if (cart.items.length > 0 && cart.restaurantId && cart.restaurantId !== item.restaurantId) {
      throw new ConflictError(
        'Cart already contains items from a different restaurant. Clear the cart first.',
      );
    }

    const existing = cart.items.find((i) => i.menuItemId === dto.menuItemId);
    if (existing) {
      existing.quantity += dto.quantity;
    } else {
      cart.items.push({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: dto.quantity,
      });
    }

    cart = { ...cart, restaurantId: item.restaurantId, updatedAt: new Date().toISOString() };
    await this.cartRepository.save(cart);
    return withTotal(cart);
  }

  async updateItemQuantity(
    userId: string,
    menuItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartWithTotal> {
    const cart = await this.requireCart(userId);
    const index = cart.items.findIndex((i) => i.menuItemId === menuItemId);
    if (index === -1) {
      throw new BadRequestError(`Item ${menuItemId} is not in the cart`);
    }

    if (dto.quantity === 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = dto.quantity;
    }

    return this.persistOrClear(cart);
  }

  async removeItem(userId: string, menuItemId: string): Promise<CartWithTotal> {
    const cart = await this.requireCart(userId);
    cart.items = cart.items.filter((i) => i.menuItemId !== menuItemId);
    return this.persistOrClear(cart);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.delete(userId);
  }

  private async requireCart(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.find(userId);
    if (!cart) {
      throw new BadRequestError('Cart is empty');
    }
    return cart;
  }

  private async persistOrClear(cart: Cart): Promise<CartWithTotal> {
    if (cart.items.length === 0) {
      await this.cartRepository.delete(cart.userId);
      const empty = emptyCart(cart.userId);
      return withTotal(empty);
    }

    const updated = { ...cart, updatedAt: new Date().toISOString() };
    await this.cartRepository.save(updated);
    return withTotal(updated);
  }
}
