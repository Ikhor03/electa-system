import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

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
