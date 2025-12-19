"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let FileStorageService = class FileStorageService {
    constructor() {
        this.uploadsDir = path.join(process.cwd(), 'uploads', 'leaves');
        this.maxFileSize = 10 * 1024 * 1024;
        this.allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
        ];
        this.ensureUploadsDirectory();
    }
    ensureUploadsDirectory() {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types: PDF, Word (DOC, DOCX), Images (JPG, PNG, GIF)`);
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
        }
    }
    async saveFile(tenantId, leaveId, file) {
        this.validateFile(file);
        const tenantDir = path.join(this.uploadsDir, tenantId);
        const leaveDir = path.join(tenantDir, leaveId);
        if (!fs.existsSync(tenantDir)) {
            fs.mkdirSync(tenantDir, { recursive: true });
        }
        if (!fs.existsSync(leaveDir)) {
            fs.mkdirSync(leaveDir, { recursive: true });
        }
        const fileExtension = path.extname(file.originalname);
        const fileName = `document_${Date.now()}${fileExtension}`;
        const filePath = path.join(leaveDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        const relativePath = path.join('uploads', 'leaves', tenantId, leaveId, fileName);
        return {
            filePath: relativePath,
            fileName: file.originalname,
        };
    }
    async getFile(filePath) {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
            throw new common_1.BadRequestException('File not found');
        }
        const buffer = fs.readFileSync(fullPath);
        const fileName = path.basename(fullPath);
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypeMap = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
        };
        const mimeType = mimeTypeMap[ext] || 'application/octet-stream';
        return {
            buffer,
            fileName,
            mimeType,
        };
    }
    async deleteFile(filePath) {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            const dir = path.dirname(fullPath);
            try {
                const files = fs.readdirSync(dir);
                if (files.length === 0) {
                    fs.rmdirSync(dir);
                }
            }
            catch (error) {
            }
        }
    }
    async deleteLeaveFiles(tenantId, leaveId) {
        const leaveDir = path.join(this.uploadsDir, tenantId, leaveId);
        if (fs.existsSync(leaveDir)) {
            fs.rmSync(leaveDir, { recursive: true, force: true });
        }
    }
};
exports.FileStorageService = FileStorageService;
exports.FileStorageService = FileStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FileStorageService);
//# sourceMappingURL=file-storage.service.js.map