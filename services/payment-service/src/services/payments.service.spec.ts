import { PaymentsService } from './payments.service';
import { PaymentsRepository } from '../repositories/payments.repository';
import { OrderServiceClient } from '../common/order-service.client';
import {
  ConflictError,
  ForbiddenError,
  InvalidStateTransitionError,
  NotFoundError,
  OrderStatus,
  PaymentStatus,
  UserRole,
} from '@food-delivery/shared';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let payments: jest.Mocked<PaymentsRepository>;
  let orderClient: jest.Mocked<OrderServiceClient>;

  const config = { paymentSuccessRate: 0.9 } as any;

  const basePayment = {
    id: 'pay-1',
    orderId: 'order-1',
    customerId: 'customer-1',
    amount: '19.98',
    status: PaymentStatus.PENDING,
    failureReason: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    payments = {
      findById: jest.fn(),
      findLatestByOrder: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<PaymentsRepository>;

    orderClient = {
      getOrder: jest.fn(),
      updateOrderStatus: jest.fn(),
    } as unknown as jest.Mocked<OrderServiceClient>;

    service = new PaymentsService(payments, orderClient, config, { publish: jest.fn() } as any);
  });

  describe('createPayment', () => {
    it('rejects when requester does not own the order', async () => {
      orderClient.getOrder.mockResolvedValue({
        id: 'order-1',
        customerId: 'someone-else',
        restaurantId: 'r1',
        status: OrderStatus.CREATED,
        totalAmount: '19.98',
      });

      await expect(
        service.createPayment('customer-1', { orderId: 'order-1' }, 'Bearer x'),
      ).rejects.toThrow(ForbiddenError);
    });

    it('rejects when order is not in CREATED status', async () => {
      orderClient.getOrder.mockResolvedValue({
        id: 'order-1',
        customerId: 'customer-1',
        restaurantId: 'r1',
        status: OrderStatus.CONFIRMED,
        totalAmount: '19.98',
      });

      await expect(
        service.createPayment('customer-1', { orderId: 'order-1' }, 'Bearer x'),
      ).rejects.toThrow(ConflictError);
    });

    it('rejects when an active payment already exists for the order', async () => {
      orderClient.getOrder.mockResolvedValue({
        id: 'order-1',
        customerId: 'customer-1',
        restaurantId: 'r1',
        status: OrderStatus.CREATED,
        totalAmount: '19.98',
      });
      payments.findLatestByOrder.mockResolvedValue({ ...basePayment, status: PaymentStatus.PENDING });

      await expect(
        service.createPayment('customer-1', { orderId: 'order-1' }, 'Bearer x'),
      ).rejects.toThrow(ConflictError);
    });

    it('allows a new payment when the previous one FAILED', async () => {
      orderClient.getOrder.mockResolvedValue({
        id: 'order-1',
        customerId: 'customer-1',
        restaurantId: 'r1',
        status: OrderStatus.CREATED,
        totalAmount: '19.98',
      });
      payments.findLatestByOrder.mockResolvedValue({ ...basePayment, status: PaymentStatus.FAILED });
      payments.create.mockResolvedValue(basePayment);

      const result = await service.createPayment('customer-1', { orderId: 'order-1' }, 'Bearer x');

      expect(result.id).toBe('pay-1');
      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.PAYMENT_PENDING);
    });
  });

  describe('processPayment', () => {
    it('throws NotFoundError when missing', async () => {
      payments.findById.mockResolvedValue(null);
      await expect(
        service.processPayment('missing', 'customer-1', {}),
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects a non-owner', async () => {
      payments.findById.mockResolvedValue(basePayment);
      await expect(
        service.processPayment('pay-1', 'not-the-customer', {}),
      ).rejects.toThrow(ForbiddenError);
    });

    it('rejects processing a payment that is not PENDING', async () => {
      payments.findById.mockResolvedValue({ ...basePayment, status: PaymentStatus.COMPLETED });
      await expect(
        service.processPayment('pay-1', 'customer-1', {}),
      ).rejects.toThrow(InvalidStateTransitionError);
    });

    it('settles to COMPLETED and confirms the order when forced to succeed', async () => {
      payments.findById.mockResolvedValue(basePayment);
      payments.updateStatus.mockResolvedValue({ ...basePayment, status: PaymentStatus.COMPLETED });

      const result = await service.processPayment('pay-1', 'customer-1', { simulateFailure: false });

      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.CONFIRMED);
    });

    it('settles to FAILED and fails the order when forced to fail', async () => {
      payments.findById.mockResolvedValue(basePayment);
      payments.updateStatus.mockResolvedValue({ ...basePayment, status: PaymentStatus.FAILED });

      const result = await service.processPayment('pay-1', 'customer-1', { simulateFailure: true });

      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(orderClient.updateOrderStatus).toHaveBeenCalledWith('order-1', OrderStatus.FAILED);
    });
  });

  describe('getStatus', () => {
    it('allows the owning customer', async () => {
      payments.findById.mockResolvedValue(basePayment);
      const result = await service.getStatus('pay-1', 'customer-1', UserRole.CUSTOMER);
      expect(result.id).toBe('pay-1');
    });

    it('rejects a different customer', async () => {
      payments.findById.mockResolvedValue(basePayment);
      await expect(
        service.getStatus('pay-1', 'someone-else', UserRole.CUSTOMER),
      ).rejects.toThrow(ForbiddenError);
    });

    it('allows ADMIN regardless of ownership', async () => {
      payments.findById.mockResolvedValue(basePayment);
      const result = await service.getStatus('pay-1', 'admin-1', UserRole.ADMIN);
      expect(result.id).toBe('pay-1');
    });
  });

  describe('refund', () => {
    it('rejects refunding a non-COMPLETED payment', async () => {
      payments.findById.mockResolvedValue({ ...basePayment, status: PaymentStatus.PENDING });
      await expect(
        service.refund('pay-1', 'customer-1', UserRole.CUSTOMER),
      ).rejects.toThrow(InvalidStateTransitionError);
    });

    it('refunds a COMPLETED payment for its owner', async () => {
      payments.findById.mockResolvedValue({ ...basePayment, status: PaymentStatus.COMPLETED });
      payments.updateStatus.mockResolvedValue({ ...basePayment, status: PaymentStatus.REFUNDED });

      const result = await service.refund('pay-1', 'customer-1', UserRole.CUSTOMER);
      expect(result.status).toBe(PaymentStatus.REFUNDED);
    });
  });
});
