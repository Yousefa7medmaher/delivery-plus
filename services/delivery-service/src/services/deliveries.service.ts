import { Injectable } from '@nestjs/common';
import {
  BadRequestError,
  ConflictError,
  DELIVERY_TRANSITIONS,
  DeliveryStatus,
  DriverStatus,
  ForbiddenError,
  InvalidStateTransitionError,
  NotFoundError,
  OrderStatus,
  UserRole,
  isTransitionAllowed,
  KafkaProducerService,
  TOPICS,
  DeliveryEventType,
  generateCorrelationId,
} from '@food-delivery/shared';
import { DeliveriesRepository } from '../repositories/deliveries.repository';
import { OrderServiceClient } from '../common/order-service.client';
import { DriverServiceClient } from '../common/driver-service.client';
import { CreateDeliveryDto } from '../dto/create-delivery.dto';
import { Delivery } from '../entities/delivery.entity';
import { v4 as uuidv4 } from 'uuid';

const DISPATCH_ROLES = [UserRole.RESTAURANT_OWNER, UserRole.ADMIN];

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly deliveries: DeliveriesRepository,
    private readonly orderClient: OrderServiceClient,
    private readonly driverClient: DriverServiceClient,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(requesterRole: UserRole, dto: CreateDeliveryDto): Promise<Delivery> {
    this.assertDispatchRole(requesterRole);

    const existing = await this.deliveries.findByOrderId(dto.orderId);
    if (existing) {
      throw new ConflictError(`A delivery already exists for order ${dto.orderId}`);
    }

    const order = await this.orderClient.getOrder(dto.orderId);
    if (order.status !== OrderStatus.READY_FOR_PICKUP) {
      throw new BadRequestError(
        `Order ${dto.orderId} is not ready for pickup (status ${order.status})`,
      );
    }

    return this.deliveries.create(dto.orderId);
  }

  async assignDriver(deliveryId: string, requesterRole: UserRole): Promise<Delivery> {
    this.assertDispatchRole(requesterRole);
    const delivery = await this.findOrThrow(deliveryId);
    this.assertTransition(delivery.status, DeliveryStatus.DRIVER_ASSIGNED);

    const driver = await this.driverClient.findAvailableDriver();
    if (!driver) {
      throw new ConflictError('No available drivers to assign');
    }

    await this.driverClient.updateDriverStatus(driver.id, DriverStatus.BUSY);
    const updated = await this.deliveries.update(deliveryId, {
      driverId: driver.id,
      status: DeliveryStatus.DRIVER_ASSIGNED,
    });

    await this.orderClient.updateOrderStatus(delivery.orderId, OrderStatus.DRIVER_ASSIGNED);

    return updated as Delivery;
  }

  async pickup(deliveryId: string, requesterId: string, requesterRole: UserRole): Promise<Delivery> {
    const delivery = await this.findOrThrow(deliveryId);
    await this.assertAssignedDriver(delivery, requesterId, requesterRole);
    this.assertTransition(delivery.status, DeliveryStatus.PICKED_UP);

    const updated = await this.deliveries.update(deliveryId, { status: DeliveryStatus.PICKED_UP });
    await this.orderClient.updateOrderStatus(delivery.orderId, OrderStatus.PICKED_UP);
    return updated as Delivery;
  }

  async start(deliveryId: string, requesterId: string, requesterRole: UserRole): Promise<Delivery> {
    const delivery = await this.findOrThrow(deliveryId);
    await this.assertAssignedDriver(delivery, requesterId, requesterRole);
    this.assertTransition(delivery.status, DeliveryStatus.IN_TRANSIT);

    // No order-service call: order has no IN_TRANSIT counterpart, it
    // remains PICKED_UP until DELIVERED.
    const updated = await this.deliveries.update(deliveryId, { status: DeliveryStatus.IN_TRANSIT });
    return updated as Delivery;
  }

  async complete(deliveryId: string, requesterId: string, requesterRole: UserRole): Promise<Delivery> {
    const delivery = await this.findOrThrow(deliveryId);
    await this.assertAssignedDriver(delivery, requesterId, requesterRole);
    this.assertTransition(delivery.status, DeliveryStatus.DELIVERED);

    const updated = await this.deliveries.update(deliveryId, { status: DeliveryStatus.DELIVERED });
    await this.orderClient.updateOrderStatus(delivery.orderId, OrderStatus.DELIVERED);
    if (delivery.driverId) {
      await this.driverClient.updateDriverStatus(delivery.driverId, DriverStatus.AVAILABLE);
    }
    return updated as Delivery;
  }

  async cancel(deliveryId: string, requesterRole: UserRole): Promise<Delivery> {
    this.assertDispatchRole(requesterRole);
    const delivery = await this.findOrThrow(deliveryId);
    this.assertTransition(delivery.status, DeliveryStatus.CANCELLED);

    const updated = await this.deliveries.update(deliveryId, { status: DeliveryStatus.CANCELLED });
    await this.orderClient.updateOrderStatus(delivery.orderId, OrderStatus.CANCELLED);
    if (delivery.driverId) {
      await this.driverClient.updateDriverStatus(delivery.driverId, DriverStatus.AVAILABLE);
    }
    return updated as Delivery;
  }

  async getById(id: string): Promise<Delivery> {
    return this.findOrThrow(id);
  }

  private assertDispatchRole(role: UserRole): void {
    if (!DISPATCH_ROLES.includes(role)) {
      throw new ForbiddenError('Only a restaurant owner or admin can dispatch deliveries');
    }
  }

  private assertTransition(from: DeliveryStatus, to: DeliveryStatus): void {
    if (!isTransitionAllowed(DELIVERY_TRANSITIONS, from, to)) {
      throw new InvalidStateTransitionError('Delivery', from, to);
    }
  }

  private async assertAssignedDriver(
    delivery: Delivery,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<void> {
    if (requesterRole === UserRole.ADMIN) return;
    if (requesterRole !== UserRole.DRIVER) {
      throw new ForbiddenError('Only the assigned driver (or admin) can perform this action');
    }
    if (!delivery.driverId) {
      throw new ConflictError('No driver is assigned to this delivery yet');
    }
    const driver = await this.driverClient.getDriver(delivery.driverId);
    if (driver.userId !== requesterId) {
      throw new ForbiddenError('You are not the driver assigned to this delivery');
    }
  }

  private async findOrThrow(id: string): Promise<Delivery> {
    const delivery = await this.deliveries.findById(id);
    if (!delivery) {
      throw new NotFoundError(`Delivery ${id} not found`);
    }
    return delivery;
  }

  private async publishEvent(eventType: DeliveryEventType, delivery: Delivery) {
    await this.kafkaProducer.publish(TOPICS.DELIVERY_EVENTS, {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      correlationId: generateCorrelationId(),
      payload: {
        deliveryId: delivery.id,
        orderId: delivery.orderId,
        driverId: delivery.driverId || undefined,
        status: delivery.status,
      },
    });
  }
}
