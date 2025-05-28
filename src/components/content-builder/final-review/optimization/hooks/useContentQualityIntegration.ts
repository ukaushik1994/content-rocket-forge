
import { useCallback, useMemo } from 'react';
import { useChecklistItems } from '../../hooks/useChecklistItems';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export interface QualityCheckSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'major' | 'minor';
  category: 'structure' | 'seo' | 'keywords' | 'solution' | 'content';
  autoFixable: boolean;
  priority: number;
  checklistItem?: string;
}

export const useContentQualityIntegration = () => {
  const { checklistItems, passedChecks, totalChecks, completionPercentage } = useChecklistItems();
  const { state } = useContentBuilder();

  // Convert failed checklist items to optimization suggestions
  const generateQualitySuggestions = useCallback((): QualityCheckSuggestion[] => {
    const suggestions: QualityCheckSuggestion[] = [];
    
    checklistItems.forEach((item, index) => {
      if (!item.passed) {
        let suggestion: QualityCheckSuggestion;
        
        // Map checklist items to specific suggestions
        if (item.title.includes('H1 tag')) {
          suggestion = {
            id: `h1-check-${index}`,
            title: 'Fix Document H1 Structure',
            description: 'Ensure your document has exactly one H1 tag for proper SEO structure.',
            type: 'critical',
            category: 'structure',
            autoFixable: true,
            priority: 10,
            checklistItem: item.title
          };
        } else if (item.title.includes('heading hierarchy')) {
          suggestion = {
            id: `hierarchy-${index}`,
            title: 'Improve Heading Hierarchy',
            description: 'Organize headings in logical order (H1 → H2 → H3) for better readability.',
            type: 'major',
            category: 'structure',
            autoFixable: true,
            priority: 8,
            checklistItem: item.title
          };
        } else if (item.title.includes('Meta title')) {
          suggestion = {
            id: `meta-title-${index}`,
            title: 'Optimize Meta Title',
            description: 'Include your primary keyword in the meta title for better SEO.',
            type: 'critical',
            category: 'seo',
            autoFixable: true,
            priority: 9,
            checklistItem: item.title
          };
        } else if (item.title.includes('Meta description')) {
          suggestion = {
            id: `meta-desc-${index}`,
            title: 'Fix Meta Description Length',
            description: 'Keep meta description between 50-160 characters for optimal search results.',
            type: 'major',
            category: 'seo',
            autoFixable: true,
            priority: 7,
            checklistItem: item.title
          };
        } else if (item.title.includes('call-to-action')) {
          suggestion = {
            id: `cta-${index}`,
            title: 'Add Call-to-Action',
            description: 'Include a compelling call-to-action to guide readers to the next step.',
            type: 'major',
            category: 'content',
            autoFixable: true,
            priority: 6,
            checklistItem: item.title
          };
        } else if (item.title.includes('keyword density')) {
          suggestion = {
            id: `keyword-density-${index}`,
            title: 'Optimize Keyword Density',
            description: 'Adjust primary keyword usage to 0.5-3% for optimal SEO performance.',
            type: 'major',
            category: 'keywords',
            autoFixable: true,
            priority: 8,
            checklistItem: item.title
          };
        } else if (item.title.includes('Secondary keywords')) {
          suggestion = {
            id: `secondary-keywords-${index}`,
            title: 'Include Secondary Keywords',
            description: 'Naturally incorporate secondary keywords throughout your content.',
            type: 'minor',
            category: 'keywords',
            autoFixable: true,
            priority: 5,
            checklistItem: item.title
          };
        } else if (item.title.includes('Solution features')) {
          suggestion = {
            id: `solution-features-${index}`,
            title: 'Incorporate Solution Features',
            description: 'Better integrate your solution\'s key features throughout the content.',
            type: 'major',
            category: 'solution',
            autoFixable: true,
            priority: 7,
            checklistItem: item.title
          };
        } else if (item.title.includes('Solution is positioned')) {
          suggestion = {
            id: `solution-positioning-${index}`,
            title: 'Improve Solution Positioning',
            description: 'Position your solution more effectively within the content flow.',
            type: 'major',
            category: 'solution',
            autoFixable: true,
            priority: 6,
            checklistItem: item.title
          };
        } else {
          // Generic suggestion for unmatched items
          suggestion = {
            id: `generic-${index}`,
            title: `Fix: ${item.title}`,
            description: 'This content quality check needs attention for optimal performance.',
            type: 'minor',
            category: 'content',
            autoFixable: false,
            priority: 3,
            checklistItem: item.title
          };
        }
        
        suggestions.push(suggestion);
      }
    });
    
    // Sort by priority (highest first)
    return suggestions.sort((a, b) => b.priority - a.priority);
  }, [checklistItems]);

  const qualitySuggestions = useMemo(() => generateQualitySuggestions(), [generateQualitySuggestions]);

  // Categorize suggestions by type
  const categorizedSuggestions = useMemo(() => {
    return {
      critical: qualitySuggestions.filter(s => s.type === 'critical'),
      major: qualitySuggestions.filter(s => s.type === 'major'),
      minor: qualitySuggestions.filter(s => s.type === 'minor'),
      byCategory: {
        structure: qualitySuggestions.filter(s => s.category === 'structure'),
        seo: qualitySuggestions.filter(s => s.category === 'seo'),
        keywords: qualitySuggestions.filter(s => s.category === 'keywords'),
        solution: qualitySuggestions.filter(s => s.category === 'solution'),
        content: qualitySuggestions.filter(s => s.category === 'content')
      }
    };
  }, [qualitySuggestions]);

  return {
    checklistItems,
    passedChecks,
    totalChecks,
    completionPercentage,
    qualitySuggestions,
    categorizedSuggestions,
    hasFailedChecks: qualitySuggestions.length > 0
  };
};
