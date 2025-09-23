import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    example: 'superadmin',
    description: 'Username for login'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ 
    example: 'admin123',
    description: 'Password for login'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
