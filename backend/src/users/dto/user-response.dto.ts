import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.VOTER })
  role: UserRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '+1234567890', nullable: true })
  phone?: string | null;

  @ApiProperty({ example: 'profile.jpg', nullable: true })
  profileImage?: string | null;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-23T10:00:00.000Z', nullable: true })
  lastLogin?: Date | null;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
