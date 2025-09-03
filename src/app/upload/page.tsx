'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Upload as UploadIcon,
  Music,
  FileAudio,
  CheckCircle,
  X,
} from 'lucide-react';

import type { DragEvent, ChangeEvent } from 'react';

import { Card, CardContent, Button, Progress } from '@/components';
import { cn, formatFileSize } from '@/lib';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  id: string;
}

const ACCEPTED_FORMATS = {
  'audio/mpeg': { ext: 'MP3', icon: Music },
  'audio/flac': { ext: 'FLAC', icon: FileAudio },
  'audio/x-ape': { ext: 'APE', icon: FileAudio },
  'audio/wav': { ext: 'WAV', icon: FileAudio },
  'audio/aac': { ext: 'AAC', icon: FileAudio },
};

export default function Upload() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = useTranslations('Upload');

  const handleFiles = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((file) =>
        Object.keys(ACCEPTED_FORMATS).includes(file.type),
      );

      for (const file of validFiles) {
        const id = Math.random().toString(36).slice(2, 11);
        const newFile: UploadedFile = {
          file,
          progress: 0,
          status: 'uploading',
          id,
        };

        setUploadedFiles((prev) => [...prev, newFile]);

        // upload with XMLHttpRequest so we can track progress per file
        const formData = new FormData();

        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        xhr.open('POST', '/api/upload');

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;

            setUploadedFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, progress: percent } : f)),
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, progress: 100, status: 'completed' } : f,
              ),
            );
          } else {
            setUploadedFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, status: 'error' } : f)),
            );
          }
        });

        // eslint-disable-next-line unicorn/prefer-add-event-listener
        xhr.onerror = () => {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, status: 'error' } : f)),
          );
        };

        xhr.send(formData);
      }
    },
    [setUploadedFiles],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();

      setIsDragOver(true);
    },
    [setIsDragOver],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault();

      setIsDragOver(false);
    },
    [setIsDragOver],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = [...e.dataTransfer.files];

      handleFiles(files);
    },
    [handleFiles, setIsDragOver],
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = [...(e.target.files || [])];

      handleFiles(files);
    },
    [handleFiles],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    },
    [setUploadedFiles],
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-balance">
            {t('title')}
          </h1>
          <p className="text-gray-600 text-lg">{t('description')}</p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8 shadow-lg drop-shadow-md border-gray-200">
          <CardContent className="p-8">
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 shadow-inner',
                isDragOver
                  ? 'border-gray-400 bg-gray-50 scale-105 shadow-md'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 hover:shadow-sm',
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={cn(
                    'p-4 rounded-full transition-colors shadow-md',
                    isDragOver
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600',
                  )}
                >
                  <UploadIcon className="h-12 w-12" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {t('Upload.title')}
                  </h3>
                  <p className="text-gray-600">{t('Upload.description')}</p>
                </div>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-800 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  {t('Upload.button')}
                </Button>

                <input
                  id="file-input"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={Object.keys(ACCEPTED_FORMATS).join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card className="shadow-lg drop-shadow-md border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('List.title')} ({uploadedFiles.length})
              </h3>
              <div className="space-y-4">
                {uploadedFiles.map((uploadedFile) => {
                  const formatInfo =
                    ACCEPTED_FORMATS[
                      uploadedFile.file.type as keyof typeof ACCEPTED_FORMATS
                    ];
                  const Icon = formatInfo?.icon || Music;

                  return (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <Icon className="h-8 w-8 text-gray-700 flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900 truncate">
                            {uploadedFile.file.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {formatFileSize(uploadedFile.file.size)}
                            </span>
                            {uploadedFile.status === 'completed' && (
                              <CheckCircle className="h-5 w-5 text-gray-700" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(uploadedFile.id)}
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {uploadedFile.status === 'uploading' && (
                          <div className="space-y-1">
                            <Progress
                              value={uploadedFile.progress}
                              className="h-2"
                            />
                            <p className="text-xs text-gray-600">
                              {Math.round(uploadedFile.progress)}%{' '}
                              {t('List.uploaded')}
                            </p>
                          </div>
                        )}

                        {uploadedFile.status === 'completed' && (
                          <p className="text-sm text-gray-700 font-medium">
                            {t('List.completed')}
                          </p>
                        )}

                        {uploadedFile.status === 'error' && (
                          <p className="text-sm text-red-600 font-medium">
                            {t('List.error')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
