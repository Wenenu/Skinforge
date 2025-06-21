// Utility for immediate file downloads
const API_BASE_URL = 'http://150.136.130.59';

export const immediateDownload = (filename: string): void => {
  // Create a hidden link element
  const link = document.createElement('a');
  link.href = `${API_BASE_URL}/download/${filename}`;
  link.download = filename;
  link.style.display = 'none';
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Specific download functions
export const downloadClientImmediately = (): void => {
  immediateDownload('SkinforgeClient.exe');
  // Set installation flag
  localStorage.setItem('skinforge_app_installed', 'true');
};

export const downloadUpdateImmediately = (): void => {
  immediateDownload('SkinforgeUpdate.exe');
};

export const downloadManualImmediately = (): void => {
  immediateDownload('SkinforgeManual.pdf');
}; 