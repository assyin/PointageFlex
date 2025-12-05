import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let tenantId: string | null = null;

    // 1. Tenter de résoudre depuis le header X-Tenant-ID
    tenantId = req.headers['x-tenant-id'] as string;

    // 2. Tenter de résoudre depuis le sous-domaine
    if (!tenantId) {
      const host = req.headers.host;
      if (host) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
          const tenant = await this.prisma.tenant.findUnique({
            where: { slug: subdomain },
            select: { id: true },
          });
          tenantId = tenant?.id || null;
        }
      }
    }

    // 3. Si connecté, utiliser le tenantId du user (depuis le JWT décodé plus tard)
    // Ceci sera géré dans le JwtStrategy

    if (!tenantId && req.path !== '/api/v1/auth/login' && !req.path.startsWith('/api/v1/auth')) {
      // On permet certaines routes sans tenant (login, etc.)
      // throw new BadRequestException('Tenant not specified');
    }

    // Attacher le tenantId à la requête
    (req as any).tenantId = tenantId;

    next();
  }
}
