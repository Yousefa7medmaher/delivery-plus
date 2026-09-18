import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '@food-delivery/shared';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';
import { IDEMPOTENCY_KEY_HEADER, parseIdempotencyKey } from '../common/idempotency-key';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment for an order (transitions order to PAYMENT_PENDING)' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description:
      'Client-generated key (UUID recommended, max 255 visible ASCII chars), scoped to the caller. ' +
      'Repeating the request with the same key returns the original payment instead of 409. ' +
      'Reusing a key for a different order returns 409.',
  })
  @ApiResponse({ status: 409, description: 'Order already has an active payment, or key reused for another order' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePaymentDto,
    @Headers('authorization') authHeader: string,
    @Headers(IDEMPOTENCY_KEY_HEADER) idempotencyKey?: string,
  ) {
    return this.paymentsService.createPayment(user.sub, dto, authHeader, parseIdempotencyKey(idempotencyKey));
  }

  @Post(':id/process')
  @ApiOperation({
    summary: 'Simulate processing a payment (settles to COMPLETED or FAILED)',
    description:
      'Retry-safe: calling it on a COMPLETED/FAILED payment returns the terminal result without ' +
      'publishing duplicate events or re-updating the order (only side effects that failed earlier are retried).',
  })
  @ApiResponse({ status: 409, description: 'Payment is currently being processed by another request' })
  process(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.paymentsService.processPayment(id, user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment status' })
  getStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.getStatus(id, user.sub, user.role);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a completed payment' })
  refund(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.refund(id, user.sub, user.role);
  }
}
