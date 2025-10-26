"use client"

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';

interface CloudinaryUploadProps {
  itemType: 'fidgiColor' | 'keycapDesign' | 'switchType' | 'prebuiltFidgi' | 'otherFidget';
  onUpload: (urls: string[]) => void;
  onDelete?: (urls: string[]) => void; // Callback when images are deleted
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  onReset?: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error' | 'deleting';
  url?: string;
  publicId?: string;
  error?: string;
}

// Updated to support otherFidget type
export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  itemType,
  onUpload,
  onDelete,
  multiple = true,
  maxFiles = 5,
  className = '',
  onReset
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInProgressRef = useRef<boolean>(false);

  // Track previously notified uploads to prevent loops
  const [notifiedUploads, setNotifiedUploads] = React.useState<Set<string>>(new Set());
  const [lastUploadBatch, setLastUploadBatch] = React.useState<string | null>(null);

  const uploadFiles = useCallback(async (filesToUpload: UploadedFile[]) => {
    // Prevent duplicate uploads
    if (uploadInProgressRef.current) {
      console.log('Upload already in progress, skipping');
      return;
    }

    uploadInProgressRef.current = true;
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    const batchId = `batch-${Date.now()}`;

    console.log(`Starting upload batch ${batchId} with ${filesToUpload.length} files`);

    // Process all files
    for (const fileItem of filesToUpload) {
      try {
        console.log(`Uploading file ${fileItem.id} in batch ${batchId}`);
        
        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('itemType', itemType);

        const response = await fetch('/api/cloudinary/upload-simple', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          console.log(`File ${fileItem.id} uploaded successfully:`, result.data.secure_url);
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'success', url: result.data.secure_url, publicId: result.data.public_id }
              : f
          ));
          uploadedUrls.push(result.data.secure_url);
        } else {
          console.error(`File ${fileItem.id} upload failed:`, result.error);
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'error', error: result.error }
              : f
          ));
        }
      } catch (error) {
        console.error(`File ${fileItem.id} upload error:`, error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        ));
      }
    }

    // Call onUpload once with all successful URLs (only if this is a new batch)
    if (uploadedUrls.length > 0 && lastUploadBatch !== batchId) {
      console.log(`Batch ${batchId} completed: calling onUpload with ${uploadedUrls.length} URLs:`, uploadedUrls);
      setLastUploadBatch(batchId);
      onUpload(uploadedUrls);
    } else if (uploadedUrls.length === 0) {
      console.log(`Batch ${batchId} completed: no successful uploads`);
    } else {
      console.log(`Batch ${batchId} already processed, skipping onUpload call`);
    }

    setIsUploading(false);
    uploadInProgressRef.current = false;
  }, [itemType, onUpload, lastUploadBatch]);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    console.log('handleFileSelect called with files:', selectedFiles.length);
    
    const fileArray = Array.from(selectedFiles);
    const newFiles: UploadedFile[] = fileArray.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading'
    }));

    console.log('New files created:', newFiles.length);

    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      const result = multiple ? updated : newFiles;
      console.log('Files state updated, total files:', result.length);
      return result;
    });

    // Start uploading immediately
    console.log('Starting upload for files:', newFiles.length);
    uploadFiles(newFiles);
  }, [multiple, uploadFiles]);

  const removeFile = async (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    
    // Set deleting status for the file
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'deleting' as const } : f
    ));
    
    // If the file was successfully uploaded to Cloudinary, delete it from CDN
    if (fileToRemove?.url && fileToRemove.status === 'success') {
      try {
        console.log('Deleting image from Cloudinary:', fileToRemove.url);
        const response = await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: fileToRemove.url }),
        });

        const result = await response.json();
        if (result.success) {
          console.log('Successfully deleted from Cloudinary:', result.data);
        } else {
          console.warn('Failed to delete from Cloudinary:', result.error);
        }
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    // Remove from local state after deletion attempt
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      
      // Notify parent component about the deletion
      if (onDelete && fileToRemove?.url) {
        const remainingUrls = updated
          .filter(f => f.url && f.status === 'success')
          .map(f => f.url!);
        onDelete(remainingUrls);
      }
      
      return updated;
    });
  };

  const clearAllFiles = async () => {
    // Delete all successfully uploaded images from Cloudinary
    const uploadedUrls = files
      .filter(f => f.url && f.status === 'success')
      .map(f => f.url);

    if (uploadedUrls.length > 0) {
      try {
        console.log('Deleting all images from Cloudinary:', uploadedUrls);
        const response = await fetch('/api/cloudinary/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: uploadedUrls }),
        });

        const result = await response.json();
        if (result.success) {
          console.log('Successfully deleted all images from Cloudinary:', result.data);
        } else {
          console.warn('Failed to delete some images from Cloudinary:', result.data);
        }
      } catch (error) {
        console.error('Error deleting all images from Cloudinary:', error);
      }
    }

    // Clear local state
    setFiles([]);
    setNotifiedUploads(new Set());
    setLastUploadBatch(null);
    uploadInProgressRef.current = false;
    
    // Notify parent component about clearing all files
    if (onDelete) {
      onDelete([]);
    }
    
    if (onReset) {
      onReset();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Reset component when itemType changes
  React.useEffect(() => {
    setFiles([]);
    setNotifiedUploads(new Set());
    setLastUploadBatch(null);
    uploadInProgressRef.current = false;
  }, [itemType]);

  // Note: onUpload is now called directly in uploadFiles function
  // This useEffect is no longer needed and was causing the loop issue

  const successfulFiles = files.filter(f => f.status === 'success');
  const errorFiles = files.filter(f => f.status === 'error');
  const uploadingFiles = files.filter(f => f.status === 'uploading');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isDragOver ? 'Drop files here' : 'Upload images'}
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop or click to select files
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-1" />
              Choose Files
            </Button>
            {multiple && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    handleFileSelect(target.files);
                  };
                  input.click();
                }}
                disabled={isUploading}
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Multiple Files
              </Button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              Files ({files.length})
            </p>
            {files.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                disabled={isUploading}
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`flex items-center space-x-3 p-3 border rounded-lg ${
                    file.status === 'success' 
                      ? 'border-green-200 bg-green-50'
                      : file.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Preview */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={file.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {file.status === 'uploading' && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Uploading...</span>
                      </div>
                    )}
                    
                    {file.status === 'success' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-xs">Success</span>
                      </div>
                    )}
                    
                    {file.status === 'error' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs">Error</span>
                      </div>
                    )}

                    {file.status === 'deleting' && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Deleting...</span>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading' || file.status === 'deleting'}
                    >
                      {file.status === 'deleting' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Uploading files...</span>
        </div>
      )}

      {/* Summary */}
      {files.length > 0 && (
        <div className="text-xs text-gray-500">
          {successfulFiles.length > 0 && (
            <p className="text-green-600">
              ✓ {successfulFiles.length} file(s) uploaded successfully
            </p>
          )}
          {errorFiles.length > 0 && (
            <p className="text-red-600">
              ✗ {errorFiles.length} file(s) failed to upload
            </p>
          )}
          {uploadingFiles.length > 0 && (
            <p className="text-blue-600">
              ⏳ {uploadingFiles.length} file(s) uploading...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
