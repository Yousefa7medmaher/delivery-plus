import { DeliveriesService } from './deliveries.service';
import { DeliveriesRepository } from '../repositories/deliveries.repository';
import { OrderServiceClient } from '../common/order-service.client';
import { DriverServiceClient } from '../common/driver-service.client';
import {
  BadRequestError,
  ConflictError,
  DeliveryStatus,
  DriverStatus,
  ForbiddenError,
  InvalidStateTransitionError,
  NotFoundError,
  OrderStatus,
  UserRole,
} from '@food-delivery/shared';

describe('DeliveriesService', () => {
  let service: DeliveriesService;
  let deliveries: jest.Mocked<DeliveriesRepository>;
  let orderClient: jest.Mocked<OrderServiceClient>;
  let driverClient: jest.Mocked<DriverServiceClient>;

  const baseDelivery = {
    id: 'delivery-1',
    orderId: 'order-1',
    driverId: undefined,
    status: DeliveryStatus.CREATED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    deliveries = {
      findById: jest.fn(),
      findByOrderId: jest.fn(),
      findActiveByDriverId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<DeliveriesRepository>;

    orderClient = {
      getOrder: jest.fn(),
      updateOrderStatus: jest.fn(),
    } as unknown as jest.Mocked<OrderServiceClient>;

    driverClient = {
      getDriver: jest.fn(),
      findAvailableDriver: jest.fn(),
      updateDriverStatus: jest.fn(),
    } as unknown as jest.Mocked<DriverServiceClient>;

    service = new DeliveriesService(deliveries, orderClient, driverClient, { publish: jest.fn() } as any);
  });

  describe('create', () => {
    it('rejects non-dispatch roles', async () => {
      await expect(
        service.create(UserRole.CUSTOMER, { orderId: 'order-1' }),
      ).rejects.toThrow(ForbiddenError);
    });

    it('rejects when a delivery already exists for the order', async () => {
      deliveries.findByOrderId.mockResolvedValue(baseDelivery);
      await expect(
        service.create(UserRole.ADMIN, { orderId: 'order-1' }),
      ).rejects.toThrow(ConflictError);
    });

    it('rejects when order is not READY_FOR_PICKUP', async () => {
      deliveries.findByOrderId.mockResolvedValue(null);
      orderClient.getOrder.mockResolvedValue({
        id: 'order-1',
        customerId: 'c1',
        restaurantId: 'r1',
        status: OrderStatus.PREPARING,
      });

      await expect(
        service.create(UserRole.RESTAURANT_OWNER, { orderId: 'order-1' }),
      ).rejects.toThrow(BadRequestError);
    });

    it('creates a delivery when order is READY_FOR_PICKUP', async () => {
      deliveries.findByOrderId.mockResolvedValue(null);
      orderClient.getOrder.mockResolvedValue({
        id: 'order-1',
        customerId: 'c1',
        restaurantId: 'r1',
        status: OrderStatus.READY_FOR_PICKUP,
      });
      deliveries.create.mockResolvedValue(baseDelivery);

      const result = await service.create(UserRole.ADMIN, { orderId: 'order-1' });
      expect(result.id).toBe('delivery-1');
    });
  });

  describe('assignDriver', () => {
    it('rejects when no driver is available', async () => {
      deliveries.findById.mockResolvedValue(baseDelivery);
      driverClient.findAvailableDriver.mockResolvedValue(null);

      await expect(service.assignDriver('delivery-1', UserRole.ADMIN)).rejects.toThrow(
        ConflictError,
      );
    });

    it('assigns the driver, marks them BUSY, and updates the order', async () => {
      deliveries.findById.mockResolvedValue(baseDelivery);
      driverClient.findAvailableDriver.mockResolvedValue({
        id: 'driver-1',
        userId: 'user-1',
        status: DriverStatus.AVAILABLE,
      });
      deliveries.update.mockResolvedValue({
        ...baseDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.DRIVER_ASSIGNED,
      });

      const result = await service.assignDriver('delivery-1', UserRole.ADMIN);

      expect(driverClient.updateDriverStatus).toHaveBeenCalledWith('driver-1', DriverStatus.BUSY);
      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.DRIVER_ASSIGNED);
      expect(result.status).toBe(DeliveryStatus.DRIVER_ASSIGNED);
    });
  });

  describe('pickup', () => {
    it('rejects a driver who is not the assigned one', async () => {
      deliveries.findById.mockResolvedValue({
        ...baseDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.DRIVER_ASSIGNED,
      });
      driverClient.getDriver.mockResolvedValue({ id: 'driver-1', userId: 'user-1', status: DriverStatus.BUSY });

      await expect(
        service.pickup('delivery-1', 'someone-else', UserRole.DRIVER),
      ).rejects.toThrow(ForbiddenError);
    });

    it('allows the assigned driver to mark pickup and updates the order', async () => {
      deliveries.findById.mockResolvedValue({
        ...baseDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.DRIVER_ASSIGNED,
      });
      driverClient.getDriver.mockResolvedValue({ id: 'driver-1', userId: 'user-1', status: DriverStatus.BUSY });
      deliveries.update.mockResolvedValue({
        ...baseDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.PICKED_UP,
      });

      const result = await service.pickup('delivery-1', 'user-1', UserRole.DRIVER);

      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.PICKED_UP);
      expect(result.status).toBe(DeliveryStatus.PICKED_UP);
    });

    it('rejects an invalid transition (e.g. pickup before assignment)', async () => {
      deliveries.findById.mockResolvedValue(baseDelivery); // status CREATED, no driver
      await expect(
        service.pickup('delivery-1', 'user-1', UserRole.DRIVER),
      ).rejects.toThrow(ConflictError); // no driver assigned yet
    });
  });

  describe('complete', () => {
    it('releases the driver back to AVAILABLE', async () => {
      deliveries.findById.mockResolvedValue({
        ...baseDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.IN_TRANSIT,
      });
      driverClient.getDriver.mockResolvedValue({ id: 'driver-1', userId: 'user-1', status: DriverStatus.BUSY });
      deliveries.update.mockResolvedValue({
        ...baseDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.DELIVERED,
      });

      const result = await service.complete('delivery-1', 'user-1', UserRole.DRIVER);

      expect(driverClient.updateDriverStatus).toHaveBeenCalledWith('driver-1', DriverStatus.AVAILABLE);
      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.DELIVERED);
      expect(result.status).toBe(DeliveryStatus.DELIVERED);
    });
  });

  describe('cancel', () => {
    it('rejects non-dispatch roles', async () => {
      await expect(service.cancel('delivery-1', UserRole.DRIVER)).rejects.toThrow(ForbiddenError);
    });

    it('cancels and releases the driver if one was assigned', async () => {
      deliveries.findById.mockResolvedValue({
        ...baseDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.DRIVER_ASSIGNED,
      });
      deliveries.update.mockResolvedValue({
        ...baseDelivery,
        driverId: 'driver-1',
        status: DeliveryStatus.CANCELLED,
      });

      const result = await service.cancel('delivery-1', UserRole.ADMIN);

      expect(driverClient.updateDriverStatus).toHaveBeenCalledWith('driver-1', DriverStatus.AVAILABLE);
      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.CANCELLED);
      expect(result.status).toBe(DeliveryStatus.CANCELLED);
    });
  });

  describe('getById', () => {
    it('throws NotFoundError when missing', async () => {
      deliveries.findById.mockResolvedValue(null);
      await expect(service.getById('missing')).rejects.toThrow(NotFoundError);
    });
  });
});
