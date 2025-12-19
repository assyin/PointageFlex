'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, File, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // en MB
  disabled?: boolean;
  label?: string;
}

export function FileUpload({
  file,
  onFileChange,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif',
  maxSize = 10,
  disabled = false,
  label = 'Formulaire de congé (PDF, Word, Image)',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (selectedFile: File): boolean => {
    // Vérifier la taille
    if (selectedFile.size > maxSize * 1024 * 1024) {
      alert(`Le fichier est trop volumineux. Taille maximale : ${maxSize}MB`);
      return false;
    }

    // Vérifier le type
    const allowedTypes = accept.split(',').map(type => type.trim().replace('.', ''));
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      alert(`Type de fichier non autorisé. Types autorisés : ${accept}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      onFileChange(selectedFile);
    }
    // Reset input pour permettre de sélectionner le même fichier à nouveau
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      onFileChange(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
      </label>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={cn(
              'cursor-pointer flex flex-col items-center gap-2',
              disabled && 'cursor-not-allowed'
            )}
          >
            <Upload className="h-8 w-8 text-text-secondary" />
            <div>
              <span className="text-sm font-medium text-primary">
                Cliquez pour téléverser
              </span>
              {' ou '}
              <span className="text-sm font-medium text-primary">
                glissez-déposez
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              PDF, Word (DOC, DOCX), Images (JPG, PNG, GIF) - Max {maxSize}MB
            </p>
          </label>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4 bg-background-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <File className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {file.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeFile}
              disabled={disabled}
              className="ml-2 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

