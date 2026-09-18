import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  BadRequestError,
  ForbiddenError,
  InvalidStateTransitionError,
  NotFoundError,
  OrderStatus,
  ORDER_TRANSITIONS,
  PaginatedResult,
  RestaurantStatus,
  UserRole,
  isTransitionAllowed,
  KafkaProducerService,
  KafkaConsumerService,
  OrderEventType,
  PaymentEventType,
  PaymentEvent,
  DeliveryEventType,
  DeliveryEvent,
  TOPICS,
  generateCorrelationId,
} from '@food-delivery/shared';
import { OrdersRepository } from '../repositories/orders.repository';
import { CartServiceClient } from '../common/cart-service.client';
import { RestaurantServiceClient } from '../common/restaurant-service.client';
import { isRoleAllowedForTransition } from '../common/order-transition-rules';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { Order } from '../entities/order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    private readonly orders: OrdersRepository,
    private readonly cartClient: CartServiceClient,
    private readonly restaurantClient: RestaurantServiceClient,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly kafkaConsumer: KafkaConsumerService,
  ) {}

  async onModuleInit() {
    await this.kafkaConsumer.subscribe<PaymentEvent['payload']>(
      TOPICS.PAYMENT_EVENTS,
      PaymentEventType.CREATED,
      async (event) => {
        await this.updateStatus(event.payload.orderId, 'system', UserRole.ADMIN, { status: OrderStatus.PAYMENT_PENDING });
      },
    );

    await this.kafkaConsumer.subscribe<PaymentEvent['payload']>(
      TOPICS.PAYMENT_EVENTS,
      PaymentEventType.COMPLETED,
      async (event) => {
        // Assume system acts as ADMIN to bypass role checks for automated transitions
        await this.updateStatus(event.payload.orderId, 'system', UserRole.ADMIN, { status: OrderStatus.CONFIRMED });
      },
    );

    await this.kafkaConsumer.subscribe<PaymentEvent['payload']>(
      TOPICS.PAYMENT_EVENTS,
      PaymentEventType.FAILED,
      async (event) => {
        await this.updateStatus(event.payload.orderId, 'system', UserRole.ADMIN, { status: OrderStatus.CANCELLED });
      },
    );

    await this.kafkaConsumer.subscribe<DeliveryEvent['payload']>(
      TOPICS.DELIVERY_EVENTS,
      DeliveryEventType.DRIVER_ASSIGNED,
      async (event) => {
        await this.updateStatus(event.payload.orderId, 'system', UserRole.ADMIN, { status: OrderStatus.DRIVER_ASSIGNED });
      },
    );

    await this.kafkaConsumer.subscribe<DeliveryEvent['payload']>(
      TOPICS.DELIVERY_EVENTS,
      DeliveryEventType.PICKED_UP,
      async (event) => {
        await this.updateStatus(event.payload.orderId, 'system', UserRole.ADMIN, { status: OrderStatus.PICKED_UP });
      },
    );

    await this.kafkaConsumer.subscribe<DeliveryEvent['payload']>(
      TOPICS.DELIVERY_EVENTS,
      DeliveryEventType.COMPLETED,
      async (event) => {
        await this.updateStatus(event.payload.orderId, 'system', UserRole.ADMIN, { status: OrderStatus.DELIVERED });
      },
    );

    await this.kafkaConsumer.start();
  }

  async createFromCart(customerId: string, authHeader: string, idempotencyKey?: string): Promise<Order> {
    if (idempotencyKey) {
      const prior = await this.orders.findByCustomerAndIdempotencyKey(customerId, idempotencyKey);
      if (prior) {
        return prior;
      }
    }

    const cart = await this.cartClient.getCart(authHeader);

    if (cart.items.length === 0 || !cart.restaurantId) {
      throw new BadRequestError('Cart is empty');
    }

    const restaurant = await this.restaurantClient.getRestaurant(cart.restaurantId);
    if (restaurant.status !== RestaurantStatus.OPEN) {
      throw new BadRequestError('Restaurant is currently closed');
    }

    try {
      const order = await this.orders.create(
        customerId,
        cart.restaurantId,
        cart.items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        cart.total,
        idempotencyKey,
      );

      await this.cartClient.clearCart(authHeader);

      await this.kafkaProducer.publish(TOPICS.ORDER_EVENTS, {
        eventId: uuidv4(),
        eventType: OrderEventType.CREATED,
        timestamp: new Date().toISOString(),
        correlationId: generateCorrelationId(),
        payload: {
          orderId: order.id,
          customerId: order.customerId,
          restaurantId: order.restaurantId,
          total: parseFloat(order.totalAmount),
          status: order.status,
        },
      });

      return order;
    } catch (error) {
      if (idempotencyKey) {
        const winner = await this.orders.findByCustomerAndIdempotencyKey(customerId, idempotencyKey);
        if (winner) {
          return winner;
        }
      }
      throw error;
    }
  }

  async getById(id: string, requesterId: string, requesterRole: UserRole): Promise<Order> {
    const order = await this.findOrThrow(id);

    if (requesterRole === UserRole.ADMIN || order.customerId === requesterId) {
      return order;
    }

    if (requesterRole === UserRole.RESTAURANT_OWNER) {
      await this.restaurantClient.assertOwnership(order.restaurantId, requesterId);
      return order;
    }

    throw new ForbiddenError('You do not have access to this order');
  }

  async listByCustomer(customerId: string, page: number, limit: number): Promise<PaginatedResult<Order>> {
    const [items, total] = await this.orders.findByCustomer(customerId, page, limit);
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
  }

  async listByRestaurant(
    restaurantId: string,
    requesterId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Order>> {
    await this.restaurantClient.assertOwnership(restaurantId, requesterId);
    const [items, total] = await this.orders.findByRestaurant(restaurantId, page, limit);
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
  }

  async updateStatus(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOrThrow(id);

    if (!isTransitionAllowed(ORDER_TRANSITIONS, order.status, dto.status)) {
      throw new InvalidStateTransitionError('Order', order.status, dto.status);
    }

    if (!isRoleAllowedForTransition(dto.status, requesterRole)) {
      throw new ForbiddenError(`Role ${requesterRole} cannot set order status to ${dto.status}`);
    }

    if (requesterRole === UserRole.CUSTOMER && order.customerId !== requesterId) {
      throw new ForbiddenError('You do not own this order');
    }

    if (requesterRole === UserRole.RESTAURANT_OWNER) {
      await this.restaurantClient.assertOwnership(order.restaurantId, requesterId);
    }

    const updated = await this.orders.updateStatus(id, dto.status);

    let eventType: OrderEventType;
    switch (dto.status) {
      case OrderStatus.CONFIRMED: eventType = OrderEventType.CONFIRMED; break;
      case OrderStatus.CANCELLED: eventType = OrderEventType.CANCELLED; break;
      case OrderStatus.PREPARING: eventType = OrderEventType.PREPARING; break;
      case OrderStatus.READY_FOR_PICKUP: eventType = OrderEventType.READY_FOR_PICKUP; break;
      case OrderStatus.DRIVER_ASSIGNED: eventType = OrderEventType.DRIVER_ASSIGNED; break;
      case OrderStatus.PICKED_UP: eventType = OrderEventType.PICKED_UP; break;
      case OrderStatus.DELIVERED: eventType = OrderEventType.DELIVERED; break;
      default: eventType = OrderEventType.CREATED; break;
    }

    await this.kafkaProducer.publish(TOPICS.ORDER_EVENTS, {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      correlationId: generateCorrelationId(),
      payload: {
        orderId: updated!.id,
        customerId: updated!.customerId,
        restaurantId: updated!.restaurantId,
        total: parseFloat(updated!.totalAmount),
        status: updated!.status,
      },
    });

    return updated as Order;
  }

  private async findOrThrow(id: string): Promise<Order> {
    const order = await this.orders.findById(id);
    if (!order) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    return order;
  }
}
