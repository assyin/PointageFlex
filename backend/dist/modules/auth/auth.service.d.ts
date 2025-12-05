import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
            tenantId: string;
            role: import(".prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
            tenantId: string;
            isActive: boolean;
            role: import(".prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshTokens(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
}
