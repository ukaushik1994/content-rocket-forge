import JSZip from 'jszip';
import { marked } from 'marked';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  content_type: string;
  approval_status: string;
  seo_score?: number;
  keywords?: any; // Json type from database
  meta_title?: string;
  meta_description?: string;
  created_at: string;
}

interface ExportOptions {
  formats: ('md' | 'html' | 'txt')[];
  includeMetadata: boolean;
}

export async function exportCampaignContent(
  campaignName: string,
  contentItems: ContentItem[],
  options: ExportOptions = { formats: ['md', 'html', 'txt'], includeMetadata: true }
): Promise<Blob> {
  const zip = new JSZip();

  // Create manifest
  if (options.includeMetadata) {
    const manifest = {
      campaign: campaignName,
      exported_at: new Date().toISOString(),
      total_items: contentItems.length,
      total_words: contentItems.reduce((sum, item) => sum + item.content.split(/\s+/).length, 0),
      average_seo_score: Math.round(
        contentItems.reduce((sum, item) => sum + (item.seo_score || 0), 0) / contentItems.length
      ),
      items: contentItems.map(item => ({
        id: item.id,
        title: item.title,
        format: item.content_type,
        word_count: item.content.split(/\s+/).length,
        seo_score: item.seo_score,
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        created_at: item.created_at
      }))
    };

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  }

  // Export each content item in requested formats
  for (const item of contentItems) {
    const safeName = item.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const folder = zip.folder(safeName);
    const keywords = Array.isArray(item.keywords) ? item.keywords.map(k => String(k)) : [];

    if (!folder) continue;

    // Markdown
    if (options.formats.includes('md')) {
      let mdContent = `# ${item.title}\n\n`;
      
      if (options.includeMetadata && item.meta_title) {
        mdContent += `**Meta Title:** ${item.meta_title}\n\n`;
      }
      
      if (options.includeMetadata && item.meta_description) {
        mdContent += `**Meta Description:** ${item.meta_description}\n\n`;
      }
      
      if (options.includeMetadata && keywords.length > 0) {
        mdContent += `**Keywords:** ${keywords.join(', ')}\n\n`;
      }
      
      mdContent += `---\n\n${item.content}`;
      
      folder.file(`${safeName}.md`, mdContent);
    }

    // HTML
    if (options.formats.includes('html')) {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item.meta_title || item.title}</title>
  ${item.meta_description ? `<meta name="description" content="${item.meta_description}">` : ''}
  ${keywords.length > 0 ? `<meta name="keywords" content="${keywords.join(', ')}">` : ''}
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    h2 { font-size: 2rem; margin-top: 2rem; }
    h3 { font-size: 1.5rem; margin-top: 1.5rem; }
    p { margin-bottom: 1rem; }
    .metadata {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
    }
    .metadata dt {
      font-weight: bold;
      display: inline;
    }
    .metadata dd {
      display: inline;
      margin: 0 0 0.5rem 0;
    }
  </style>
</head>
<body>
  ${options.includeMetadata ? `
  <div class="metadata">
    ${item.meta_title ? `<dl><dt>Meta Title:</dt> <dd>${item.meta_title}</dd></dl>` : ''}
    ${item.meta_description ? `<dl><dt>Meta Description:</dt> <dd>${item.meta_description}</dd></dl>` : ''}
    ${keywords.length > 0 ? `<dl><dt>Keywords:</dt> <dd>${keywords.join(', ')}</dd></dl>` : ''}
    <dl><dt>Word Count:</dt> <dd>${item.content.split(/\s+/).length}</dd></dl>
    ${item.seo_score ? `<dl><dt>SEO Score:</dt> <dd>${item.seo_score}/100</dd></dl>` : ''}
  </div>
  ` : ''}
  
  <h1>${item.title}</h1>
  ${marked(item.content)}
</body>
</html>`;
      
      folder.file(`${safeName}.html`, htmlContent);
    }

    // Plain Text
    if (options.formats.includes('txt')) {
      let txtContent = `${item.title}\n${'='.repeat(item.title.length)}\n\n`;
      
      if (options.includeMetadata) {
        if (item.meta_title) txtContent += `Meta Title: ${item.meta_title}\n`;
        if (item.meta_description) txtContent += `Meta Description: ${item.meta_description}\n`;
        if (keywords.length > 0) {
          txtContent += `Keywords: ${keywords.join(', ')}\n`;
        }
        txtContent += `Word Count: ${item.content.split(/\s+/).length}\n`;
        if (item.seo_score) txtContent += `SEO Score: ${item.seo_score}/100\n`;
        txtContent += '\n';
      }
      
      txtContent += item.content;
      
      folder.file(`${safeName}.txt`, txtContent);
    }
  }

  // Generate ZIP file
  return await zip.generateAsync({ type: 'blob' });
}
