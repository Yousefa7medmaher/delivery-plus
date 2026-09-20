import { Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, JwtPayload } from '@food-delivery/shared';
import { UsersService } from '../services/users.service';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserProfile } from '../entities/user-profile.entity';
import { InternalAuthGuard } from '../guards/internal-auth.guard';

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('internal/users')
  @UseGuards(InternalAuthGuard)
  @ApiOperation({
    summary: 'Internal: create a profile (called synchronously by auth-service on registration)',
  })
  createProfile(@Body() dto: CreateProfileDto): Promise<UserProfile> {
    return this.usersService.createProfile(dto);
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current authenticated user profile' })
  getMe(@CurrentUser() user: JwtPayload): Promise<UserProfile> {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the current authenticated user profile' })
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto): Promise<UserProfile> {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get('users/me/orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user order history (proxied from order-service)' })
  getMyOrders(
    @Headers('authorization') authHeader: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.usersService.getOrderHistory(authHeader, parseInt(page, 10), parseInt(limit, 10));
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user profile by id' })
  getById(@Param('id') id: string): Promise<UserProfile> {
    return this.usersService.getProfile(id);
  }
}
