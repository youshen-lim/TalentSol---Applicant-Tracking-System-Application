import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  Eye,
  Download
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { UploadedDocument } from '@/types/application';

interface FileUploadWithProgressProps {
  fieldId: string;
  label: string;
  description?: string;
  required?: boolean;
  accept?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  onUpload: (fieldId: string, files: File[]) => Promise<UploadedDocument[]>;
  onRemove?: (fieldId: string, documentId: string) => void;
  existingFiles?: UploadedDocument[];
  disabled?: boolean;
}

interface FileUploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  document?: UploadedDocument;
}

const FileUploadWithProgress: React.FC<FileUploadWithProgressProps> = ({
  fieldId,
  label,
  description,
  required = false,
  accept = ['.pdf', '.doc', '.docx'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  multiple = false,
  onUpload,
  onRemove,
  existingFiles = [],
  disabled = false
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStates, setUploadStates] = useState<Record<string, FileUploadState>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('document') || mimeType.includes('word')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (accept.length > 0 && !accept.includes(fileExtension)) {
      return `File type not supported. Allowed types: ${accept.join(', ')}`;
    }

    // Check max files limit
    const totalFiles = existingFiles.length + Object.keys(uploadStates).length;
    if (totalFiles >= maxFiles) {
      return `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`;
    }

    return null;
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    const filesToUpload: File[] = [];
    const errors: string[] = [];

    // Validate each file
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        filesToUpload.push(file);
      }
    });

    // Show validation errors
    if (errors.length > 0) {
      toast.atsBlue({
        title: 'Upload Error',
        description: errors.join('\n')
      });
      return;
    }

    // Start upload process for valid files
    const newUploadStates: Record<string, FileUploadState> = {};
    filesToUpload.forEach(file => {
      const uploadId = `${fieldId}_${Date.now()}_${file.name}`;
      newUploadStates[uploadId] = {
        file,
        progress: 0,
        status: 'uploading'
      };
    });

    setUploadStates(prev => ({ ...prev, ...newUploadStates }));

    try {
      // Simulate upload progress for each file
      const uploadPromises = Object.entries(newUploadStates).map(async ([uploadId, state]) => {
        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadStates(prev => ({
            ...prev,
            [uploadId]: { ...prev[uploadId], progress }
          }));
        }

        return { uploadId, file: state.file };
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Call the actual upload function
      const uploadedDocuments = await onUpload(fieldId, filesToUpload);

      // Update states with completed uploads
      const completedStates: Record<string, FileUploadState> = {};
      uploadResults.forEach(({ uploadId }, index) => {
        completedStates[uploadId] = {
          ...newUploadStates[uploadId],
          status: 'completed',
          progress: 100,
          document: uploadedDocuments[index]
        };
      });

      setUploadStates(prev => ({ ...prev, ...completedStates }));

      toast.atsBlue({
        title: 'Upload Successful',
        description: `${filesToUpload.length} file${filesToUpload.length > 1 ? 's' : ''} uploaded successfully`
      });

    } catch (error) {
      // Mark all uploads as failed
      const errorStates: Record<string, FileUploadState> = {};
      Object.keys(newUploadStates).forEach(uploadId => {
        errorStates[uploadId] = {
          ...newUploadStates[uploadId],
          status: 'error',
          error: 'Upload failed. Please try again.'
        };
      });

      setUploadStates(prev => ({ ...prev, ...errorStates }));

      toast.atsBlue({
        title: 'Upload Failed',
        description: 'There was an error uploading your files. Please try again.'
      });
    }
  }, [fieldId, onUpload, toast, validateFile, maxFiles, existingFiles.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveUpload = (uploadId: string) => {
    setUploadStates(prev => {
      const newStates = { ...prev };
      delete newStates[uploadId];
      return newStates;
    });
  };

  const handleRemoveExisting = (documentId: string) => {
    if (onRemove) {
      onRemove(fieldId, documentId);
    }
  };

  const allFiles = [
    ...existingFiles,
    ...Object.values(uploadStates)
      .filter(state => state.status === 'completed' && state.document)
      .map(state => state.document!)
  ];

  const canUploadMore = allFiles.length < maxFiles;

  return (
    <div className="space-y-4">
      {/* Label */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Upload Area */}
      {canUploadMore && !disabled && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${isDragOver 
              ? 'border-ats-blue bg-ats-blue/5' 
              : 'border-gray-300 hover:border-ats-blue hover:bg-gray-50'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept.length > 0 && `Supported formats: ${accept.join(', ')}`}
            </p>
            <p className="text-xs text-gray-500">
              Max size: {formatFileSize(maxFileSize)}
              {maxFiles > 1 && ` • Max ${maxFiles} files`}
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept.join(',')}
            multiple={multiple && maxFiles > 1}
            onChange={handleFileInputChange}
          />
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {existingFiles.map((doc) => {
            const IconComponent = getFileIcon(doc.mimeType);
            return (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <IconComponent className="h-5 w-5 text-green-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">
                    {doc.originalName}
                  </p>
                  <p className="text-xs text-green-600">
                    {formatFileSize(doc.fileSize)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600">
                    <Download className="h-3 w-3" />
                  </Button>
                  {onRemove && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveExisting(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Progress */}
      {Object.entries(uploadStates).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploading Files</h4>
          {Object.entries(uploadStates).map(([uploadId, state]) => {
            const IconComponent = getFileIcon(state.file.type);
            return (
              <div key={uploadId} className="space-y-2">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <IconComponent className="h-5 w-5 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {state.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(state.file.size)}
                    </p>
                  </div>
                  
                  {state.status === 'uploading' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{state.progress}%</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveUpload(uploadId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {state.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  
                  {state.status === 'error' && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveUpload(uploadId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {state.status === 'uploading' && (
                  <Progress value={state.progress} className="w-full" />
                )}
                
                {state.status === 'error' && state.error && (
                  <p className="text-sm text-red-500">{state.error}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* File Limit Message */}
      {!canUploadMore && (
        <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Maximum number of files ({maxFiles}) reached
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadWithProgress;
