const API_BASE_URL = 'https://skinforge.pro';

export interface DownloadOptions {
  filename?: string;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export const downloadFile = async (
  endpoint: string, 
  options: DownloadOptions = {}
): Promise<void> => {
  const {
    filename,
    onProgress,
    onError,
    onSuccess
  } = options;

  try {
    // Method 1: Try fetch with progress tracking
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/octet-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total > 0 && onProgress) {
          const progress = (loaded / total) * 100;
          onProgress(progress);
        }
      }
    }

    const blob = new Blob(chunks);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    onSuccess?.();
  } catch (error) {
    console.warn('Fetch download failed, trying direct download:', error);
    
    // Fallback to direct download
    try {
      const link = document.createElement('a');
      link.href = `${API_BASE_URL}${endpoint}`;
      link.download = filename || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onSuccess?.();
    } catch (fallbackError) {
      const errorMessage = 'Failed to download file. Please try again.';
      console.error('Download error:', fallbackError);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
};

// Specific download functions for your app
export const downloadClient = async (options?: DownloadOptions): Promise<void> => {
  // Use direct download endpoint for immediate download
  const link = document.createElement('a');
  link.href = `${API_BASE_URL}/download/SkinforgeClient.exe`;
  link.download = 'SkinforgeClient.exe';
  link.style.display = 'none';
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Set installation flag
  localStorage.setItem('skinforge_app_installed', 'true');
  
  options?.onSuccess?.();
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