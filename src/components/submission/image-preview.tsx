"use client";

import * as React from "react";
import { X, Download, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  size: number;
}

interface ImagePreviewProps {
  files: ImageFile[];
  className?: string;
}

export function ImagePreview({ files, className }: ImagePreviewProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  if (files.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">No images uploaded</p>
      </div>
    );
  }

  const currentFile = files[selectedIndex];

  const handleDownload = async () => {
    try {
      const response = await fetch(currentFile.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFile.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") setIsFullscreen(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Main Image Display */}
      <div className="relative bg-muted rounded-lg overflow-hidden">
        <img
          src={currentFile.url}
          alt={currentFile.fileName}
          className="w-full h-auto max-h-[600px] object-contain cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setIsFullscreen(true)}
            title="Fullscreen"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      {files.length > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            disabled={selectedIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm text-muted-foreground">
            {selectedIndex + 1} / {files.length}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            disabled={selectedIndex === files.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* File Info */}
      <div className="mt-3 text-sm">
        <p className="font-medium">{currentFile.fileName}</p>
        <p className="text-muted-foreground">
          {(currentFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      {/* Thumbnails */}
      {files.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {files.map((file, index) => (
            <button
              key={file.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all",
                index === selectedIndex
                  ? "border-primary scale-105"
                  : "border-muted hover:border-muted-foreground"
              )}
            >
              <img
                src={file.url}
                alt={file.fileName}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <DialogTitle className="sr-only">Image Fullscreen View</DialogTitle>
          <div
            className="relative w-full h-full flex items-center justify-center bg-black"
            onKeyDown={handleKeyDown}
          >
            <img
              src={currentFile.url}
              alt={currentFile.fileName}
              className="max-w-full max-h-[85vh] object-contain"
            />

            {/* Navigation Buttons */}
            {files.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Close Button */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-4 right-4"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Image Counter */}
            {files.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {selectedIndex + 1} / {files.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
