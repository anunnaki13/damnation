import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../config/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username sudah digunakan');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
        userRoles: dto.roleIds
          ? {
              create: dto.roleIds.map((roleId) => ({
                roleId: BigInt(roleId),
              })),
            }
          : undefined,
      },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    return {
      id: Number(user.id),
      username: user.username,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: { userRoles: { include: { role: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: data.map((u) => ({
        id: Number(u.id),
        username: u.username,
        email: u.email,
        isActive: u.isActive,
        lastLogin: u.lastLogin,
        roles: u.userRoles.map((ur) => ur.role.name),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return {
      id: Number(user.id),
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }
}
