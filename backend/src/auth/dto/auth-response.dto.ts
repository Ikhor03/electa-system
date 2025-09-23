import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  phone?: string | null;

  @ApiProperty({ required: false })
  profileImage?: string | null;

  @ApiProperty({ required: false })
  lastLogin?: Date | null;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token (expires in 15 minutes)'
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token (expires in 7 days)'
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto
  })
  user: UserResponseDto;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token to get new access token'
  })
  refreshToken: string;
}
