import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, JwtPayload, RateLimit, RateLimitGuard } from '@food-delivery/shared';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RequestWithContext } from '@food-delivery/shared';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 5, windowSeconds: 60 })
  @ApiOperation({ summary: 'Register a new user (creates credentials + profile)' })
  register(@Body() dto: RegisterDto, @Req() req: RequestWithContext): Promise<AuthResponseDto> {
    return this.authService.register(dto, req.correlationId);
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 5, windowSeconds: 60 })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive a JWT access token' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the current JWT payload' })
  me(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }
}
