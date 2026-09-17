import { Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, JwtPayload, RateLimit, RateLimitGuard } from '@food-delivery/shared';
import { OrdersService } from '../services/orders.service';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { ListOrdersQueryDto } from '../dto/list-orders-query.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RateLimitGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @RateLimit({ limit: 5, windowSeconds: 60 })
  @ApiOperation({ summary: 'Create an order from the current cart' })
  create(@CurrentUser() user: JwtPayload, @Headers('authorization') authHeader: string) {
    return this.ordersService.createFromCart(user.sub, authHeader);
  }

  @Get()
  @ApiOperation({ summary: "List the current customer's own orders (order history)" })
  listMine(@CurrentUser() user: JwtPayload, @Query() query: ListOrdersQueryDto) {
    return this.ordersService.listByCustomer(user.sub, query.page, query.limit);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'List orders for a restaurant (owner only)' })
  listForRestaurant(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.ordersService.listByRestaurant(restaurantId, user.sub, query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id (owner, restaurant owner, or admin)' })
  getById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.getById(id, user.sub, user.role);
  }

  @Patch(':id/status')
  @RateLimit({ limit: 10, windowSeconds: 60 })
  @ApiOperation({ summary: 'Transition an order to a new status (role- and ownership-checked)' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, user.sub, user.role, dto);
  }
}
