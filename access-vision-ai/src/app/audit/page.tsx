'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileImage } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

export default function NewAuditPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsSubmitting(true);
    
    // In a real app, upload the file here.
    // For this MVP, we simulate upload and transition to results.
    setTimeout(() => {
      // Create a fake object URL for demo purposes so it passes to the next screen
      const fileUrl = URL.createObjectURL(file);
      // Store in session storage to retrieve in results
      sessionStorage.setItem('auditImage', fileUrl);
      router.push('/audit/results');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Accessibility Audit</h1>
        <p className="text-muted-foreground mt-2">
          Upload an image of a space to identify potential accessibility barriers.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="projectName" className="text-sm font-medium">Project Name</label>
              <input 
                id="projectName" 
                required 
                placeholder="e.g., Main Entrance Ramp" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <input 
                  id="location" 
                  required 
                  placeholder="e.g., North Building" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">Building Type</label>
                <select 
                  id="type" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="education">College/School</option>
                  <option value="healthcare">Hospital/Healthcare</option>
                  <option value="commercial">Office/Commercial</option>
                  <option value="public">Public Space</option>
                  <option value="retail">Shopping Mall/Retail</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Image</label>
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-muted/50",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                file ? "bg-muted/30" : ""
              )}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileImage className="h-10 w-10 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">Click or drag to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                  <UploadCloud className="h-10 w-10 mb-2" />
                  <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs">JPG, PNG, or WEBP (max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!file || isSubmitting}
            className="w-full inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? "Uploading & Analyzing..." : "Run AI Analysis"}
          </button>
        </form>
      </div>
    </div>
  );
}
