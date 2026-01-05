import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SendMailOptions } from './interfaces/send-mail-options.interface';
export declare class MailService implements OnModuleInit {
    private prisma;
    private readonly logger;
    private transporter;
    private config;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    sendMail(options: SendMailOptions, tenantId?: string): Promise<void>;
    private logEmailToDatabase;
    private validateMailOptions;
    private logSimulationEmail;
    private logEmailError;
}
