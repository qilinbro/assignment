import type { StorageProvider, UploadedFile } from "@/types";

/**
 * Storage Service
 *
 * File storage using the server's API upload endpoint
 */
export class ApiStorageProvider implements StorageProvider {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = "/api") {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Upload a file and return its URL
   */
  async upload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.apiBaseUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "上传失败");
    }

    const result = await response.json();
    return result.url;
  }

  /**
   * Delete a file by its URL/path
   */
  async delete(url: string): Promise<void> {
    // Extract path from URL (handle both full URLs and relative paths)
    const path = url.startsWith("/uploads/") ? url : new URL(url).pathname;

    const response = await fetch(`${this.apiBaseUrl}/upload?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "删除失败");
    }
  }

  /**
   * Get a public URL for a file path
   */
  async getUrl(path: string): Promise<string> {
    return path;
  }

  /**
   * Validate file type
   */
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate file size
   */
  isValidFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  /**
   * Get file metadata
   */
  getFileMetadata(file: File): UploadedFile {
    return {
      url: "", // Will be set after upload
      fileName: file.name,
      fileType: file.type,
      size: file.size,
    };
  }
}

// Singleton instance using real API storage
export const storageProvider = new ApiStorageProvider();
