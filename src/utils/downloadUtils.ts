const API_BASE_URL = 'http://150.136.130.59/api/';

export interface DownloadOptions {
  filename?: string;
  contentType?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export const downloadFile = async (
  url: string, 
  options: DownloadOptions = {}
): Promise<void> => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = options.filename || 'download';
    
    // For mobile devices, we need to handle downloads differently
    if (isMobileDevice()) {
      // On mobile, we'll open the file in a new tab for viewing/downloading
      window.open(downloadUrl, '_blank');
      
      // Clean up the object URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } else {
      // On desktop, trigger download directly
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
    }
    
    options.onComplete?.();
  } catch (error) {
    console.error('Download error:', error);
    options.onError?.(error instanceof Error ? error.message : 'Download failed');
  }
};

export const downloadWithProgress = async (
  url: string,
  options: DownloadOptions = {}
): Promise<void> => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Unable to read response body');
    }

    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      if (total > 0) {
        const progress = (loaded / total) * 100;
        options.onProgress?.(progress);
      }
    }

    const blob = new Blob(chunks);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = options.filename || 'download';
    
    if (isMobileDevice()) {
      window.open(downloadUrl, '_blank');
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }
    
    options.onComplete?.();
  } catch (error) {
    console.error('Download error:', error);
    options.onError?.(error instanceof Error ? error.message : 'Download failed');
  }
};

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

export const getDownloadUrl = (type: 'client' | 'update' | 'manual' | string): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
  return `${baseUrl}/api/download/${type}`;
};

export const showDownloadInstructions = (): void => {
  if (isMobileDevice()) {
    alert('On mobile devices, the file will open in a new tab. You can then save it to your device.');
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Specific download functions for your app
export const downloadClient = async (options?: DownloadOptions): Promise<void> => {
  return downloadFile('download/client', {
    filename: 'SkinforgeClient.exe',
    ...options
  });
};

export const downloadUpdate = async (options?: DownloadOptions): Promise<void> => {
  return downloadFile('download/update', {
    filename: 'SkinforgeUpdate.exe',
    ...options
  });
};

export const downloadManual = async (options?: DownloadOptions): Promise<void> => {
  return downloadFile('download/manual', {
    filename: 'SkinforgeManual.pdf',
    ...options
  });
}; 