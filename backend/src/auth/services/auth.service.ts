import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { JwtPayload, JwtRefreshPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  /**
   * Validate user credentials for local strategy
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      return user;
    }

    return null;
  }

  /**
   * Login user and return tokens
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      this.logger.error('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.error('Account is deactivated');
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user);
    
    // Log authentication event
    await this.logAuthEvent(user.id, 'LOGIN', 'User logged in successfully');

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === registerDto.username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username,
        name: registerDto.name,
        password: hashedPassword,
        role: registerDto.role || UserRole.VOTER,
        phone: registerDto.phone,
      },
    });

    const tokens = await this.generateTokens(user);

    // Log registration event
    await this.logAuthEvent(user.id, 'REGISTER', 'User registered successfully');

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find the refresh token in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!storedToken.user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(storedToken.user);

      // Delete old refresh token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Log token refresh event
      await this.logAuthEvent(storedToken.user.id, 'TOKEN_REFRESH', 'Tokens refreshed successfully');

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user by invalidating refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (storedToken) {
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });

        // Log logout event
        await this.logAuthEvent(storedToken.user.id, 'LOGOUT', 'User logged out successfully');
      }
    } catch (error) {
      // Silently fail for logout
    }
  }

  /**
   * Get user by ID (for JWT strategy)
   */
  async getUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Generate access token (short-lived)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    // Generate refresh token (long-lived)
    const refreshTokenId = `${user.id}_${Date.now()}_${Math.random()}`;
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      tokenId: refreshTokenId,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Remove sensitive information from user object
   */
  private sanitizeUser(user: User): UserResponseDto {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Log authentication events for audit
   */
  private async logAuthEvent(userId: number, action: string, details: string): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource: 'AUTH',
          details: { message: details },
        },
      });
    } catch (error) {
      // Silently fail for audit logging
      console.error('Failed to log auth event:', error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Invalidate all refresh tokens for this user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Log password change event
    await this.logAuthEvent(userId, 'PASSWORD_CHANGE', 'Password changed successfully');
  }
}
