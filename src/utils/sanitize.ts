import DOMPurify from 'dompurify';
import { marked } from 'marked';

/**
 * Sanitize raw HTML content to prevent XSS attacks
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'code', 'pre', 'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'hr', 'span', 'div', 'sub', 'sup'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'id',
      'src', 'alt', 'title', 'width', 'height'
    ],
    ALLOW_DATA_ATTR: false
  });
}

/**
 * Convert markdown to sanitized HTML
 * @param markdown - Markdown string to convert
 * @returns Sanitized HTML string
 */
export async function sanitizeMarkdown(markdown: string): Promise<string> {
  if (!markdown) return '';
  
  // Configure marked for security
  marked.setOptions({
    gfm: true,
    breaks: true,
  });
  
  const html = await marked(markdown);
  return sanitizeHtml(html);
}

/**
 * Synchronous version of markdown sanitization using regex-based conversion
 * For use in components where async isn't practical
 * @param markdown - Markdown string to convert
 * @returns Sanitized HTML string
 */
export function sanitizeMarkdownSync(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Convert headers
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  
  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert unordered list items
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  
  // Convert ordered list items
  html = html.replace(/^[0-9]+\. (.*?)$/gm, '<li>$1</li>');
  
  // Convert paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<li>)/g, '$1');
  html = html.replace(/(<\/li>)<\/p>/g, '$1');
  
  return sanitizeHtml(html);
}

/**
 * Escape HTML entities for safe text display (not HTML rendering)
 * @param text - Plain text to escape
 * @returns Escaped text safe for display
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Strip all HTML tags and return plain text
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}
