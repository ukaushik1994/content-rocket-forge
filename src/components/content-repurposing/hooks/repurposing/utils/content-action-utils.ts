
import { toast } from 'sonner';

/**
 * Utility function to copy content to clipboard
 */
export const copyToClipboard = (content: string): void => {
  if (!content) {
    toast.error('No content to copy');
    return;
  }
  
  navigator.clipboard.writeText(content);
  toast.success('Copied to clipboard');
};

/**
 * Utility function to download content as text file
 */
export const downloadAsText = (content: string, formatName: string): void => {
  if (!content || !formatName) {
    toast.error('No content to download');
    return;
  }
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `content_${formatName.toLowerCase().replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded as ${a.download}`);
};
