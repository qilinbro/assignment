import type { StorageProvider, UploadedFile } from "@/types";

/**
 * Storage Service
 *
 * Abstraction layer for file storage
 * Can be easily swapped with different providers (S3, R2, OSS, etc.)
 */

export class MockStorageProvider implements StorageProvider {
  private storageCounter = 0;

  /**
   * Upload a file and return its URL
   * In a real implementation, this would upload to S3, R2, etc.
   */
  async upload(file: File): Promise<string> {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate a mock URL
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${this.storageCounter++}.${fileExtension}`;
    const url = `/uploads/${fileName}`;

    // In a real implementation, we would:
    // 1. Upload the file to the storage service
    // 2. Get back the URL/key
    // 3. Store metadata if needed

    return url;
  }

  /**
   * Delete a file by its URL
   * In a real implementation, this would delete from S3, R2, etc.
   */
  async delete(url: string): Promise<void> {
    // Simulate deletion delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    // In a real implementation, we would:
    // 1. Extract the key from the URL
    // 2. Delete the file from the storage service

    console.log(`Deleted file: ${url}`);
  }

  /**
   * Get a public URL for a file path
   * In a real implementation, this might generate signed URLs
   */
  async getUrl(path: string): Promise<string> {
    // In a real implementation, this might:
    // 1. Generate a signed URL for private files
    // 2. Return a CDN URL for public files
    // 3. Handle different URL formats

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

/**
 * Example implementations for different storage providers
 * These can be uncommented and configured when needed
 */

/*
// AWS S3 Implementation
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucketName: string;

  constructor(config: { region: string; bucketName: string; credentials: { accessKeyId: string; secretAccessKey: string } }) {
    this.client = new S3Client({
      region: config.region,
      credentials: config.credentials,
    });
    this.bucketName = config.bucketName;
  }

  async upload(file: File): Promise<string> {
    const key = `${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: file.type,
    });

    await this.client.send(command);

    return `https://${this.bucketName}.s3.${this.client.config.region}.amazonaws.com/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = this.extractKeyFromUrl(url);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  async getUrl(path: string): Promise<string> {
    return path;
  }

  private extractKeyFromUrl(url: string): string {
    const match = url.match(/\.amazonaws\.com\/(.+)$/);
    return match ? match[1] : url;
  }
}
*/

/*
// Cloudflare R2 Implementation
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class R2StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucketName: string;
  private accountId: string;

  constructor(config: { accountId: string; bucketName: string; credentials: { accessKeyId: string; secretAccessKey: string } }) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: config.credentials,
    });
    this.bucketName = config.bucketName;
    this.accountId = config.accountId;
  }

  async upload(file: File): Promise<string> {
    const key = `${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: file.type,
    });

    await this.client.send(command);

    return `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = this.extractKeyFromUrl(url);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  async getUrl(path: string): Promise<string> {
    return path;
  }

  private extractKeyFromUrl(url: string): string {
    const match = url.match(/\.r2\.cloudflarestorage\.com\/(.+)$/);
    return match ? match[1] : url;
  }
}
*/

/*
// Supabase Storage Implementation
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStorageProvider implements StorageProvider {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(config: { url: string; anonKey: string; bucketName: string }) {
    this.supabase = createClient(config.url, config.anonKey);
    this.bucketName = config.bucketName;
  }

  async upload(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await this.supabase
      .storage
      .from(this.bucketName)
      .upload(fileName, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = this.supabase
      .storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async delete(url: string): Promise<void> {
    const fileName = this.extractFileNameFromUrl(url);

    const { error } = await this.supabase
      .storage
      .from(this.bucketName)
      .remove([fileName]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async getUrl(path: string): Promise<string> {
    return path;
  }

  private extractFileNameFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}
*/

// Singleton instance - using mock implementation
export const storageProvider = new MockStorageProvider();

// To use a different provider, replace the instance:
// export const storageProvider = new S3StorageProvider({ ... });
