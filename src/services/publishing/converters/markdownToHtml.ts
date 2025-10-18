import { marked } from 'marked';

/**
 * Convert Markdown to HTML for WordPress
 */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { 
    gfm: true, // GitHub Flavored Markdown
    breaks: true // Convert line breaks to <br>
  }) as string;
}
