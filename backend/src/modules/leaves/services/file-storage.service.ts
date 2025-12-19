import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStorageService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'leaves');
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];

  constructor() {
    // Créer le dossier uploads s'il n'existe pas
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Valide le fichier uploadé
   */
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Vérifier le type MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: PDF, Word (DOC, DOCX), Images (JPG, PNG, GIF)`,
      );
    }

    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Sauvegarde un fichier pour un congé
   */
  async saveFile(
    tenantId: string,
    leaveId: string,
    file: Express.Multer.File,
  ): Promise<{ filePath: string; fileName: string }> {
    this.validateFile(file);

    // Créer le dossier pour ce tenant et ce congé
    const tenantDir = path.join(this.uploadsDir, tenantId);
    const leaveDir = path.join(tenantDir, leaveId);

    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }
    if (!fs.existsSync(leaveDir)) {
      fs.mkdirSync(leaveDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.originalname);
    const fileName = `document_${Date.now()}${fileExtension}`;
    const filePath = path.join(leaveDir, fileName);

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, file.buffer);

    // Retourner le chemin relatif pour stockage en BDD
    const relativePath = path.join('uploads', 'leaves', tenantId, leaveId, fileName);

    return {
      filePath: relativePath,
      fileName: file.originalname,
    };
  }

  /**
   * Récupère le fichier
   */
  async getFile(filePath: string): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      throw new BadRequestException('File not found');
    }

    const buffer = fs.readFileSync(fullPath);
    const fileName = path.basename(fullPath);
    
    // Déterminer le type MIME à partir de l'extension
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypeMap: Record<string, string> = {
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

  /**
   * Supprime un fichier
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);

      // Supprimer le dossier parent s'il est vide
      const dir = path.dirname(fullPath);
      try {
        const files = fs.readdirSync(dir);
        if (files.length === 0) {
          fs.rmdirSync(dir);
        }
      } catch (error) {
        // Ignorer les erreurs de suppression de dossier
      }
    }
  }

  /**
   * Supprime tous les fichiers d'un congé
   */
  async deleteLeaveFiles(tenantId: string, leaveId: string): Promise<void> {
    const leaveDir = path.join(this.uploadsDir, tenantId, leaveId);

    if (fs.existsSync(leaveDir)) {
      fs.rmSync(leaveDir, { recursive: true, force: true });
    }
  }
}

