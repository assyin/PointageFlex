import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refresh(user: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
