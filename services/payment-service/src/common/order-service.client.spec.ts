import { BadRequestError } from '@food-delivery/shared';
import { OrderServiceClient } from './order-service.client';

describe('PaymentService.OrderServiceClient', () => {
  const validOrderId = '550e8400-e29b-41d4-a716-446655440000';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches an order using a valid UUID v4 id', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: validOrderId, customerId: '11111111-1111-41d4-a716-446655440000', restaurantId: '22222222-2222-41d4-a716-446655440000', status: 'confirmed', totalAmount: '19.99' }),
    });
    global.fetch = fetchMock as any;

    const client = new OrderServiceClient({ orderServiceUrl: 'http://order-service:3006' } as any, {
      mint: async () => 'token',
    } as any);

    await expect(client.getOrder(validOrderId, 'Bearer test')).resolves.toMatchObject({ id: validOrderId });
    expect(fetchMock).toHaveBeenCalledWith(`http://order-service:3006/orders/${validOrderId}`, {
      headers: { Authorization: 'Bearer test' },
    });
  });

  it('rejects malformed orderId before making the request', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as any;

    const client = new OrderServiceClient({ orderServiceUrl: 'http://order-service:3006' } as any, {
      mint: async () => 'token',
    } as any);
    const promise = client.getOrder('http://evil.example', 'Bearer test');

    await expect(promise).rejects.toThrow(BadRequestError);
    await expect(promise).rejects.toThrow('orderId must be a valid UUID v4');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
