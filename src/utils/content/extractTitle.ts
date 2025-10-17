/**
 * Extracts the title from generated content (first markdown heading)
 * Strips markdown syntax like ** and # characters
 */
export function extractTitleFromContent(content: string): string {
  if (!content || content.trim() === '') {
    console.warn('[extractTitle] Empty or undefined content received');
    return '';
  }

  // Log first 200 chars for debugging
  console.log('[extractTitle] Processing content (first 200 chars):', content.substring(0, 200));

  // Split content into lines
  const lines = content.split('\n');
  
  // Find the first non-empty line
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      // Remove markdown heading syntax (# ## ### etc)
      let title = trimmed.replace(/^#+\s*/, '');
      
      // Remove bold markdown syntax (**text** or __text__)
      title = title.replace(/\*\*(.*?)\*\*/g, '$1');
      title = title.replace(/__(.*?)__/g, '$1');
      
      // Remove italic markdown syntax (*text* or _text_)
      title = title.replace(/\*(.*?)\*/g, '$1');
      title = title.replace(/_(.*?)_/g, '$1');
      
      const extractedTitle = title.trim();
      console.log('[extractTitle] Successfully extracted title:', extractedTitle);
      return extractedTitle;
    }
  }
  
  console.warn('[extractTitle] No title found in content - no non-empty lines detected');
  return '';
}
