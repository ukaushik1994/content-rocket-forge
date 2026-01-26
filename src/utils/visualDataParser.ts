/**
 * Visual Data Parser
 * Extracts and parses visual data from AI responses
 * Handles JSON blocks, markdown code blocks, and structured responses
 */

import { VisualData } from '@/types/enhancedChat';

export interface ParsedVisualData {
  content: string;
  visualData: VisualData[] | null;
  hasVisualData: boolean;
}

/**
 * Parse JSON from a string, handling various edge cases
 */
function safeJsonParse(str: string): any | null {
  try {
    return JSON.parse(str);
  } catch {
    // Try to fix common JSON issues
    try {
      // Remove trailing commas
      const fixed = str.replace(/,(\s*[}\]])/g, '$1');
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
}

/**
 * Extract JSON blocks from markdown code blocks
 */
function extractJsonBlocks(content: string): string[] {
  const blocks: string[] = [];
  
  // Match ```json ... ``` blocks
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/gi;
  let match;
  while ((match = jsonBlockRegex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }
  
  // Match ``` ... ``` blocks that contain JSON
  const genericBlockRegex = /```\s*([\s\S]*?)```/gi;
  while ((match = genericBlockRegex.exec(content)) !== null) {
    const blockContent = match[1].trim();
    if (blockContent.startsWith('{') || blockContent.startsWith('[')) {
      blocks.push(blockContent);
    }
  }
  
  return blocks;
}

/**
 * Check if an object looks like visual data
 */
function isVisualDataObject(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  
  // Check for common visual data type indicators
  const visualTypes = [
    'chart', 'metrics', 'table', 'workflow', 'summary',
    'multi_chart_analysis', 'queue_status', 'campaign_dashboard',
    'generated_image', 'generated_images', 'generated_video'
  ];
  
  if (obj.type && visualTypes.includes(obj.type)) {
    return true;
  }
  
  // Check for chart-like structures
  if (obj.chartConfig || obj.charts || obj.data) {
    return true;
  }
  
  // Check for metrics arrays
  if (Array.isArray(obj.metrics)) {
    return true;
  }
  
  return false;
}

/**
 * Convert raw chart data to proper visual data format
 */
function normalizeToVisualData(obj: any): VisualData | null {
  // Already in correct format
  if (obj.type && ['chart', 'metrics', 'table', 'multi_chart_analysis'].includes(obj.type)) {
    return obj as VisualData;
  }
  
  // Has chartConfig but missing type
  if (obj.chartConfig) {
    return {
      type: 'chart',
      chartConfig: obj.chartConfig,
      title: obj.title,
      description: obj.description
    } as VisualData;
  }
  
  // Has charts array (multi-chart)
  if (Array.isArray(obj.charts)) {
    return {
      type: 'multi_chart_analysis',
      charts: obj.charts,
      title: obj.title || 'Analysis',
      description: obj.description
    } as VisualData;
  }
  
  // Has metrics array
  if (Array.isArray(obj.metrics)) {
    return {
      type: 'metrics',
      metrics: obj.metrics
    } as VisualData;
  }
  
  // Has data array - treat as chart
  if (Array.isArray(obj.data) && obj.data.length > 0) {
    return {
      type: 'chart',
      chartConfig: {
        type: obj.type || 'bar',
        data: obj.data,
        categories: obj.categories || ['name'],
        series: obj.series || [{ dataKey: 'value', name: 'Value' }]
      },
      title: obj.title
    } as VisualData;
  }
  
  return null;
}

/**
 * Parse AI response content to extract visual data
 */
export function parseVisualDataFromContent(content: string): ParsedVisualData {
  const visualDataItems: VisualData[] = [];
  let cleanedContent = content;
  
  // Extract JSON blocks from markdown
  const jsonBlocks = extractJsonBlocks(content);
  
  for (const block of jsonBlocks) {
    const parsed = safeJsonParse(block);
    
    if (parsed) {
      if (isVisualDataObject(parsed)) {
        const normalized = normalizeToVisualData(parsed);
        if (normalized) {
          visualDataItems.push(normalized);
          // Remove the JSON block from content
          cleanedContent = cleanedContent.replace(new RegExp('```json\\s*' + escapeRegex(block) + '\\s*```', 'g'), '');
          cleanedContent = cleanedContent.replace(new RegExp('```\\s*' + escapeRegex(block) + '\\s*```', 'g'), '');
        }
      } else if (Array.isArray(parsed)) {
        // Check if it's an array of visual data items
        for (const item of parsed) {
          if (isVisualDataObject(item)) {
            const normalized = normalizeToVisualData(item);
            if (normalized) {
              visualDataItems.push(normalized);
            }
          }
        }
      }
    }
  }
  
  // Also try to find inline JSON (without code blocks)
  const inlineJsonRegex = /\{[\s\S]*?"type"\s*:\s*"(chart|metrics|table|multi_chart_analysis)"[\s\S]*?\}/g;
  let match;
  while ((match = inlineJsonRegex.exec(content)) !== null) {
    const parsed = safeJsonParse(match[0]);
    if (parsed && isVisualDataObject(parsed)) {
      const normalized = normalizeToVisualData(parsed);
      if (normalized && !visualDataItems.some(v => JSON.stringify(v) === JSON.stringify(normalized))) {
        visualDataItems.push(normalized);
      }
    }
  }
  
  // Clean up excessive whitespace from removed blocks
  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n').trim();
  
  return {
    content: cleanedContent,
    visualData: visualDataItems.length > 0 ? visualDataItems : null,
    hasVisualData: visualDataItems.length > 0
  };
}

/**
 * Merge visual data from AI response with any parsed from content
 */
export function mergeVisualData(
  responseVisualData: VisualData[] | undefined,
  parsedVisualData: VisualData[] | null
): VisualData[] | undefined {
  if (!responseVisualData && !parsedVisualData) {
    return undefined;
  }
  
  const merged: VisualData[] = [];
  
  if (responseVisualData) {
    merged.push(...responseVisualData);
  }
  
  if (parsedVisualData) {
    // Add parsed items that don't duplicate existing ones
    for (const item of parsedVisualData) {
      const isDuplicate = merged.some(
        existing => existing.type === item.type && 
        JSON.stringify(existing) === JSON.stringify(item)
      );
      if (!isDuplicate) {
        merged.push(item);
      }
    }
  }
  
  return merged.length > 0 ? merged : undefined;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
