"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://172.17.112.163:3001',
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (process.env.NODE_ENV !== 'production') {
                if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/:\d+$/, ''))) || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('172.17.')) {
                    callback(null, true);
                }
                else {
                    callback(null, true);
                }
            }
            else {
                if (origin && allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
            const messages = errors.map((error) => {
                const constraints = error.constraints || {};
                const property = error.property;
                const rejectedValue = error.value;
                return {
                    property,
                    value: rejectedValue,
                    constraints: Object.values(constraints),
                };
            });
            return new common_1.BadRequestException({
                statusCode: 400,
                message: 'Erreur de validation',
                errors: messages,
            });
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('PointageFlex API')
        .setDescription('API de gestion de présence et pointage multi-tenant')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Auth', 'Authentification')
        .addTag('Tenants', 'Gestion des entreprises')
        .addTag('Users', 'Gestion des utilisateurs')
        .addTag('Employees', 'Gestion des employés')
        .addTag('Attendance', 'Gestion des pointages')
        .addTag('Shifts', 'Gestion des shifts')
        .addTag('Teams', 'Gestion des équipes')
        .addTag('Schedules', 'Gestion des plannings')
        .addTag('Leaves', 'Gestion des congés')
        .addTag('Overtime', 'Gestion des heures supplémentaires')
        .addTag('Reports', 'Rapports et exports')
        .addTag('Audit', 'Logs d\'audit')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`🌐 Network access: http://0.0.0.0:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map