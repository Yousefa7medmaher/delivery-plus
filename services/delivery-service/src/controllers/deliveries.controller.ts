import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '@food-delivery/shared';
import { DeliveriesService } from '../services/deliveries.service';
import { CreateDeliveryDto } from '../dto/create-delivery.dto';

@ApiTags('deliveries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a delivery for an order that is READY_FOR_PICKUP' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDeliveryDto) {
    return this.deliveriesService.create(user.role, dto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Auto-assign the next available driver to a delivery' })
  assign(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.deliveriesService.assignDriver(id, user.role);
  }

  @Post(':id/pickup')
  @ApiOperation({ summary: 'Driver marks the order as picked up from the restaurant' })
  pickup(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.deliveriesService.pickup(id, user.sub, user.role);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Driver starts the delivery run (PICKED_UP -> IN_TRANSIT)' })
  start(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.deliveriesService.start(id, user.sub, user.role);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Driver marks the delivery as completed' })
  complete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.deliveriesService.complete(id, user.sub, user.role);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a delivery (dispatch role only)' })
  cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.deliveriesService.cancel(id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a delivery by id' })
  getById(@Param('id') id: string) {
    return this.deliveriesService.getById(id);
  }
}
