
import { v4 as uuid } from 'uuid';
import { SerpSelection } from '@/contexts/content-builder/types';

interface OutlineSection {
  id: string;
  title: string;
  type?: string;
  notes?: string;
  relatedKeywords?: string[];
}

interface GroupedItems {
  keyword: SerpSelection[];
  question: SerpSelection[];
  entity: SerpSelection[];
  heading: SerpSelection[];
  contentGap: SerpSelection[];
  topRank: SerpSelection[];
}

export async function generateOutlineFromSelections(
  mainKeyword: string,
  selectedItems: SerpSelection[],
  customInstructions: string
): Promise<OutlineSection[]> {
  // Group selected items by type for better organization
  const itemsByType = {
    keyword: selectedItems.filter(item => item.type === 'keyword'),
    question: selectedItems.filter(item => item.type === 'question'),
    entity: selectedItems.filter(item => item.type === 'entity'),
    heading: selectedItems.filter(item => item.type === 'heading'),
    contentGap: selectedItems.filter(item => item.type === 'contentGap'),
    topRank: selectedItems.filter(item => item.type === 'topRank')
  };

  // Local processing - no artificial delay needed
  // The grouping and section creation is fast enough to be synchronous
  return createOutlineSections(mainKeyword, itemsByType);
}

function createOutlineSections(
  mainKeyword: string,
  itemsByType: GroupedItems
): OutlineSection[] {
  const newOutline: OutlineSection[] = [];
      
  // Use headings as primary structure if available
  if (itemsByType.heading.length > 0) {
    itemsByType.heading.forEach(heading => {
      newOutline.push({
        id: uuid(),
        title: heading.content,
        type: 'heading',
        notes: 'From top-ranking content headings'
      });
    });
  }
  
  // Use questions as main sections
  itemsByType.question.forEach(question => {
    newOutline.push({
      id: uuid(),
      title: question.content,
      type: 'question',
      notes: 'Based on commonly asked questions'
    });
  });
  
  // Add content gaps as sections
  itemsByType.contentGap.forEach(gap => {
    newOutline.push({
      id: uuid(),
      title: gap.content,
      notes: gap.source || 'Content opportunity from gap analysis',
      type: 'contentGap'
    });
  });
  
  // If no specific sections are selected, create a standard outline structure
  if (newOutline.length === 0) {
    newOutline.push(
      {
        id: uuid(),
        title: `Introduction to ${mainKeyword}`,
        notes: "Brief overview of the topic and why it's important"
      },
      {
        id: uuid(),
        title: `What is ${mainKeyword}?`,
        notes: "Definition and key concepts"
      },
      {
        id: uuid(),
        title: `Benefits of ${mainKeyword}`,
        notes: "List main advantages and outcomes"
      },
      {
        id: uuid(),
        title: `How to Use ${mainKeyword}`,
        notes: "Step-by-step guide with practical advice"
      },
      {
        id: uuid(),
        title: `Conclusion: Key Takeaways`,
        notes: "Summary of the most important points"
      }
    );
  }
  
  // Add a section for keywords if present
  if (itemsByType.keyword.length > 0) {
    newOutline.push({
      id: uuid(),
      title: "Key Terms & Definitions",
      type: 'keywords',
      notes: 'Define these important terms for your readers',
      relatedKeywords: itemsByType.keyword.map(k => k.content)
    });
  }
  
  // Add a section for entities if present
  if (itemsByType.entity.length > 0) {
    newOutline.push({
      id: uuid(),
      title: "Important Entities & Concepts",
      type: 'entities',
      notes: 'Cover these key topics for comprehensiveness',
      relatedKeywords: itemsByType.entity.map(e => e.content)
    });
  }
  
  return newOutline;
}
