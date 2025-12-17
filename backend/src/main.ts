import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS - Autoriser plusieurs origines pour WSL et localhost
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://172.17.112.163:3001', // IP WSL pour accès depuis Windows
  ].filter(Boolean); // Filtrer les valeurs undefined

  app.enableCors({
    origin: (origin, callback) => {
      // En développement, autoriser toutes les origines locales
      if (process.env.NODE_ENV !== 'production') {
        if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/:\d+$/, ''))) || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('172.17.')) {
          callback(null, true);
        } else {
          callback(null, true); // En dev, on autorise tout
        }
      } else {
        // En production, vérifier strictement
        if (origin && allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
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
        return new BadRequestException({
          statusCode: 400,
          message: 'Erreur de validation',
          errors: messages,
        });
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  
  // Écouter sur 0.0.0.0 pour être accessible depuis le réseau (important pour WSL)
  await app.listen(port, host);

  // Obtenir l'adresse IP locale pour WSL
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      // Ignorer les adresses internes et IPv6
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌐 Network access: http://${host}:${port}`);
  if (localIP !== 'localhost') {
    console.log(`📍 Local IP: http://${localIP}:${port}`);
  }
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`\n💡 Pour accéder depuis Windows (WSL):`);
  console.log(`   1. Configurez le port forwarding: netsh interface portproxy add v4tov4 listenport=${port} listenaddress=0.0.0.0 connectport=${port} connectaddress=${localIP}`);
  console.log(`   2. Ajoutez la règle de pare-feu: New-NetFirewallRule -DisplayName 'WSL Backend' -Direction Inbound -LocalPort ${port} -Action Allow -Protocol TCP`);
}

bootstrap();
