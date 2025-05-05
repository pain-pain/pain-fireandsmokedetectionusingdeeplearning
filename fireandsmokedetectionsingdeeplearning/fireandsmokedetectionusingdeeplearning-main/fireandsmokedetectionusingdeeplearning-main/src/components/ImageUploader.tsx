
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

type ImageUploaderProps = {
  onImageSelected: (image: File) => void;
  disabled?: boolean;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Validate file is an image
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, JPEG, PNG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    onImageSelected(file);
  };

  return (
    <div>
      <div
        className={`dropzone ${dragActive ? "border-primary" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={disabled ? undefined : handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg, image/jpg, image/png"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <div className="text-center">
          <p className="text-lg mb-2">Drag and drop file here</p>
          <p className="text-sm text-muted-foreground mb-4">or</p>
          <Button 
            variant="outline" 
            disabled={disabled}
          >
            Browse files
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Limit 10MB per file • JPG, JPEG, PNG
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
