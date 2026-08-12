export interface StorageProvider {
  upload(file: File): Promise<string>;
  delete(url: string): Promise<void>;
  getUrl(path: string): Promise<string>;
}

export interface UploadedFile {
  url: string;
  fileName: string;
  fileType: string;
  size: number;
}
