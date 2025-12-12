import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Le tenantId peut venir du middleware (req.tenantId) ou du user JWT
    return (request as any).tenantId || request.user?.tenantId;
  },
);
