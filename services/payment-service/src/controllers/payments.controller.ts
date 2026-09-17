import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '@food-delivery/shared';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment for an order (transitions order to PAYMENT_PENDING)' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePaymentDto,
    @Headers('authorization') authHeader: string,
  ) {
    return this.paymentsService.createPayment(user.sub, dto, authHeader);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Simulate processing a payment (settles to COMPLETED or FAILED)' })
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
