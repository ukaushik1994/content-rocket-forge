import { ImageSlot } from '@/components/content/ImagePlaceholder';
import { v4 as uuidv4 } from 'uuid';

interface DetectionOptions {
  minWordsPerImage?: number;
  maxImages?: number;
  includeIntro?: boolean;
  includeConclusion?: boolean;
}

interface ContentSection {
  heading: string;
  content: string;
  position: number;
  level: number;
}

/**
 * Detects optimal image placement locations in content
 * Returns an array of ImageSlot objects with auto-generated prompts
 */
export function detectImageLocations(
  content: string,
  options: DetectionOptions = {}
): ImageSlot[] {
  const {
    minWordsPerImage = 400,
    maxImages = 5,
    includeIntro = true,
    includeConclusion = false
  } = options;

  const slots: ImageSlot[] = [];
  const sections = parseContentSections(content);
  const totalWords = countWords(content);
  
  // Calculate optimal number of images based on content length
  const suggestedImageCount = Math.min(
    maxImages,
    Math.max(1, Math.floor(totalWords / minWordsPerImage))
  );

  // Always add hero/intro image if content is substantial
  if (includeIntro && totalWords > 200) {
    const introContext = extractIntroContext(content);
    slots.push({
      id: uuidv4(),
      position: 0,
      prompt: generatePromptFromContext(introContext, 'hero'),
      context: introContext,
      status: 'pending'
    });
  }

  // Add images after major sections (H2 headings)
  const h2Sections = sections.filter(s => s.level === 2);
  const sectionsToIllustrate = selectSectionsToIllustrate(
    h2Sections, 
    suggestedImageCount - slots.length - (includeConclusion ? 1 : 0)
  );

  for (const section of sectionsToIllustrate) {
    slots.push({
      id: uuidv4(),
      position: section.position,
      prompt: generatePromptFromContext(section.content, 'section', section.heading),
      context: section.heading,
      status: 'pending'
    });
  }

  // Add conclusion image if requested and content is long enough
  if (includeConclusion && totalWords > 1000) {
    const conclusionContext = extractConclusionContext(content);
    slots.push({
      id: uuidv4(),
      position: content.length,
      prompt: generatePromptFromContext(conclusionContext, 'conclusion'),
      context: conclusionContext,
      status: 'pending'
    });
  }

  return slots.slice(0, maxImages);
}

/**
 * Parses content into sections based on headings
 */
function parseContentSections(content: string): ContentSection[] {
  const sections: ContentSection[] = [];
  const lines = content.split('\n');
  let currentSection: ContentSection | null = null;
  let position = 0;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);
    
    if (h2Match || h3Match) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        heading: (h2Match?.[1] || h3Match?.[1]) ?? '',
        content: '',
        position: position,
        level: h2Match ? 2 : 3
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
    
    position += line.length + 1;
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Selects which sections should have illustrations
 */
function selectSectionsToIllustrate(
  sections: ContentSection[], 
  count: number
): ContentSection[] {
  if (sections.length <= count) {
    return sections;
  }

  // Distribute evenly across content
  const step = sections.length / count;
  const selected: ContentSection[] = [];
  
  for (let i = 0; i < count; i++) {
    const index = Math.floor(i * step);
    if (sections[index]) {
      selected.push(sections[index]);
    }
  }

  return selected;
}

/**
 * Generates an image prompt from content context
 */
function generatePromptFromContext(
  context: string, 
  type: 'hero' | 'section' | 'conclusion',
  heading?: string
): string {
  // Clean and extract key concepts
  const cleanContext = context
    .replace(/[#*_`\[\]]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 500);

  const keywords = extractKeywords(cleanContext);
  
  switch (type) {
    case 'hero':
      return `Professional, high-quality hero image representing: ${keywords.slice(0, 5).join(', ')}. Modern, clean design with vibrant colors.`;
    case 'section':
      return `Illustrative image for "${heading}": ${keywords.slice(0, 4).join(', ')}. Clear, informative visual that complements the text.`;
    case 'conclusion':
      return `Conclusive, inspiring image summarizing: ${keywords.slice(0, 4).join(', ')}. Positive, forward-looking aesthetic.`;
    default:
      return `Visual representation of: ${keywords.slice(0, 5).join(', ')}.`;
  }
}

/**
 * Extracts key concepts/keywords from text
 */
function extractKeywords(text: string): string[] {
  // Remove common words and extract meaningful terms
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'this', 'that',
    'these', 'those', 'it', 'its', 'they', 'them', 'their', 'what', 'which',
    'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also'
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count frequency
  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 10);
}

/**
 * Extracts intro context for hero image
 */
function extractIntroContext(content: string): string {
  const lines = content.split('\n');
  let intro = '';
  
  for (const line of lines) {
    if (line.startsWith('##')) break;
    intro += line + ' ';
    if (intro.length > 300) break;
  }
  
  return intro.trim();
}

/**
 * Extracts conclusion context
 */
function extractConclusionContext(content: string): string {
  const lines = content.split('\n').reverse();
  let conclusion = '';
  
  for (const line of lines) {
    if (line.startsWith('##')) break;
    conclusion = line + ' ' + conclusion;
    if (conclusion.length > 300) break;
  }
  
  return conclusion.trim();
}

/**
 * Counts words in content
 */
function countWords(content: string): number {
  return content.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Determines if content should have images auto-generated
 */
export function shouldAutoGenerateImages(content: string): boolean {
  const wordCount = countWords(content);
  return wordCount >= 200;
}

/**
 * Suggests optimal image count based on content
 */
export function suggestImageCount(content: string): number {
  const wordCount = countWords(content);
  if (wordCount < 300) return 1;
  if (wordCount < 800) return 2;
  if (wordCount < 1500) return 3;
  if (wordCount < 2500) return 4;
  return 5;
}
