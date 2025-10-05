import { estimateObjectTokens } from './token-counter.ts';

interface TruncationConfig {
  maxContentLength: number;
  keepMetadataFields: string[];
}

export function truncateContentItem(item: any, config: TruncationConfig): any {
  if (!item) return item;
  
  const truncated = {
    id: item.id,
    title: item.title,
    content_type: item.content_type,
    seo_score: item.seo_score,
    status: item.status,
    created_at: item.created_at,
    solution_id: item.solution_id,
    
    // Intelligently truncate content
    content: item.content 
      ? item.content.substring(0, config.maxContentLength) + (item.content.length > config.maxContentLength ? '... [truncated]' : '')
      : null,
    
    // Keep only essential metadata
    metadata: extractEssentialMetadata(item.metadata, config.keepMetadataFields),
    
    // Keep keywords array
    keywords: item.keywords || []
  };
  
  return truncated;
}

function extractEssentialMetadata(metadata: any, allowedFields: string[]): any {
  if (!metadata) return {};
  
  const essential: any = {};
  const criticalFields = ['mainKeyword', 'contentType', 'wordCount', 'seoScore'];
  
  [...criticalFields, ...allowedFields].forEach(field => {
    if (metadata[field] !== undefined) {
      essential[field] = metadata[field];
    }
  });
  
  // Remove bloat
  delete essential.selectionStats;
  delete essential.selections;
  delete essential.outline;
  
  return essential;
}
