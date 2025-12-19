export declare class FileStorageService {
    private readonly uploadsDir;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor();
    private ensureUploadsDirectory;
    validateFile(file: Express.Multer.File): void;
    saveFile(tenantId: string, leaveId: string, file: Express.Multer.File): Promise<{
        filePath: string;
        fileName: string;
    }>;
    getFile(filePath: string): Promise<{
        buffer: Buffer;
        fileName: string;
        mimeType: string;
    }>;
    deleteFile(filePath: string): Promise<void>;
    deleteLeaveFiles(tenantId: string, leaveId: string): Promise<void>;
}
