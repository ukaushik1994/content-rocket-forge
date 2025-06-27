
/**
 * Format numbers with K, M, B suffixes for better readability
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) {
    return 'N/A';
  }

  const absNum = Math.abs(num);
  
  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
}

/**
 * Calculate logarithmic progress for search volume display
 */
export function calculateSearchVolumeProgress(volume: number | undefined | null): number {
  if (!volume || volume <= 0) return 0;
  
  // Use logarithmic scale: 1K = 20%, 10K = 40%, 100K = 60%, 1M = 80%, 10M+ = 100%
  const logScale = Math.log10(volume);
  
  if (logScale >= 7) return 100; // 10M+
  if (logScale >= 6) return 80;  // 1M-10M
  if (logScale >= 5) return 60;  // 100K-1M
  if (logScale >= 4) return 40;  // 10K-100K
  if (logScale >= 3) return 20;  // 1K-10K
  
  return Math.max(5, (logScale / 3) * 20); // Minimum 5% for any volume
}

/**
 * Get color class based on search volume level
 */
export function getSearchVolumeColor(volume: number | undefined | null): string {
  if (!volume) return 'text-gray-400';
  
  if (volume >= 1000000) return 'text-green-400'; // 1M+
  if (volume >= 100000) return 'text-blue-400';   // 100K+
  if (volume >= 10000) return 'text-yellow-400';  // 10K+
  
  return 'text-orange-400'; // <10K
}
