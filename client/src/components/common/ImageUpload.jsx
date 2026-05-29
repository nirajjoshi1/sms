import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const ImageUpload = ({
  value = [],
  onChange,
  multiple = false,
  maxFiles = 10,
  label = "Upload Images",
  helperText = "Click or drag images to upload"
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Normalize value to always be an array
  const images = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    const filesToUpload = Array.from(files);

    // Check file limit
    if (multiple && (images.length + filesToUpload.length) > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    if (!multiple && filesToUpload.length > 1) {
      toast.error('Only one image allowed');
      return;
    }

    try {
      setUploading(true);

      if (multiple) {
        // Upload multiple files
        const formData = new FormData();
        filesToUpload.forEach(file => {
          formData.append('images', file);
        });

        const response = await api.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const uploadedUrls = response.data.data.map(file => file.url);
        onChange([...images, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      } else {
        // Upload single file
        const formData = new FormData();
        formData.append('image', filesToUpload[0]);

        const response = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        onChange(response.data.data.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (indexOrUrl) => {
    if (multiple) {
      const newImages = images.filter((_, idx) => idx !== indexOrUrl);
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
        {label}
      </label>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-4 transition-all ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/20'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleUpload(e.target.files)}
          disabled={uploading || (!multiple && images.length >= 1)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-xs font-bold text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{helperText}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className={`grid gap-2 ${multiple ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1'}`}>
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted/20">
                <img
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(multiple ? index : imageUrl)}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {multiple && images.length > 0 && (
        <p className="text-[9px] text-muted-foreground ml-1">
          {images.length} / {maxFiles} images uploaded
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
