
import { ContentBuilderState, ContentBuilderAction, SerpSelection } from '../types/index';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { transformSerpData, extractAllSelections } from '@/services/serpDataTransformer';

// Process SERP response format using the unified transformer with clean data validation
const processStructuredSerpSelections = (serpData: any): SerpSelection[] => {
  if (!serpData) {
    console.warn('No SERP data provided for processing');
    return [];
  }

  console.log('🔄 Processing SERP data for selections:', serpData);
  
  try {
    // Validate data is clean before processing
    const dataString = JSON.stringify(serpData);
    if (dataString.includes('SerpAPI') || dataString.includes('serpapi') || dataString.includes('Serpstack')) {
      console.warn('⚠️ Contaminated SERP data detected, cleaning before processing');
      // Clean the data
      serpData = cleanContaminatedSerpData(serpData);
    }

    // Use the unified transformer to normalize the data
    const normalizedData = transformSerpData(serpData);
    
    // Extract all selections from the normalized data
    const allSelections = extractAllSelections(normalizedData);
    
    console.log(`✅ Processed ${allSelections.length} clean selections from SERP data`);
    return allSelections;
  } catch (error) {
    console.error('❌ Error processing SERP selections:', error);
    return [];
  }
};

/**
 * Clean contaminated SERP data by removing provider references
 */
function cleanContaminatedSerpData(data: any): any {
  if (!data) return data;
  
  const cleanString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/\b(serp\s*api|serpapi|serpstack)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const cleanObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(cleanObject);
    } else if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = cleanObject(value);
      }
      return cleaned;
    } else if (typeof obj === 'string') {
      return cleanString(obj);
    }
    return obj;
  };
  
  return cleanObject(data);
}

export const createSerpActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeKeyword = async (keyword: string, forceRefresh: boolean = false) => {
    if (!keyword) return;
    
    // Start loading
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      console.log(`🎯 Starting SERP analysis for keyword: "${keyword}"`);
      
      // Make API call to analyze keyword
      const serpData = await analyzeKeywordSerp(keyword, forceRefresh);
      
      // Update SERP data in state
      dispatch({ type: 'SET_SERP_DATA', payload: serpData });
      
      if (!serpData) {
        toast.info("No SERP data available. Add your API key in Settings to get keyword insights, FAQs, and content opportunities.", {
          duration: 6000,
          action: {
            label: "Add API Key",
            onClick: () => {
              window.location.href = "/settings/api";
            }
          }
        });
        console.log("❌ No SERP data returned - showing 'No Data Available' state");
        return; // Exit early to prevent further processing
      } else {
        console.log("✅ SERP data successfully retrieved:", {
          keyword: serpData.keyword,
          hasQuestions: serpData.peopleAlsoAsk?.length > 0,
          hasHeadings: serpData.headings?.length > 0,
          hasContentGaps: serpData.contentGaps?.length > 0,
          hasKeywords: serpData.keywords?.length > 0
        });
        
        // Process SERP selections using the unified transformer
        const structuredSelections = processStructuredSerpSelections(serpData);
        console.log("✅ Processed clean SERP selections:", structuredSelections.length);
        
        // Add new selections to context (they start as unselected)
        structuredSelections.forEach(selection => {
          const existingItem = state.serpSelections.find(
            item => item.type === selection.type && item.content === selection.content
          );
          
          if (!existingItem) {
            // Add the selection as available but not selected
            dispatch({ 
              type: 'ADD_SERP_SELECTION', 
              payload: selection
            });
          }
        });
        
        if (serpData.isMockData) {
          toast.warning("Using limited mock data. Add your SERP API key for comprehensive real insights.");
        } else {
          toast.success(`Analysis complete! Found ${structuredSelections.length} content opportunities from real SERP data.`, {
            description: `${serpData.peopleAlsoAsk?.length || 0} questions, ${serpData.headings?.length || 0} headings, ${serpData.contentGaps?.length || 0} content gaps identified`
          });
        }
      }
    } catch (error) {
      console.error('❌ Error analyzing keyword:', error);
      dispatch({ type: 'SET_SERP_DATA', payload: null });
      toast.error("Failed to analyze keyword. Please check your API key and try again.", {
        description: error.message,
        action: {
          label: "Check Settings",
          onClick: () => {
            window.location.href = "/settings/api";
          }
        }
      });
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };
  
  const addContentFromSerp = (content: string, type: string) => {
    dispatch({ 
      type: 'TOGGLE_SERP_SELECTION', 
      payload: { type, content } 
    });
  };
  
  const generateOutlineFromSelections = () => {
    const selectedItems = state.serpSelections.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to generate an outline");
      return;
    }
    
    console.log('🎯 Generating outline from selections:', {
      totalSelected: selectedItems.length,
      byType: selectedItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });
    
    // Create a more structured outline from selected items
    // Group items by type
    const headings = selectedItems.filter(item => item.type === 'heading').map(item => item.content);
    const questions = selectedItems.filter(item => item.type === 'question' || item.type === 'peopleAlsoAsk').map(item => item.content);
    const keywords = selectedItems.filter(item => item.type === 'keyword' || item.type === 'relatedSearch').map(item => item.content);
    const topStories = selectedItems.filter(item => item.type === 'topStory').map(item => item.content);
    const contentGaps = selectedItems.filter(item => item.type === 'contentGap').map(item => item.content);
    
    // Create outline sections based on selected items
    let outlineSections = [];
    
    // Start with introduction
    outlineSections.push("Introduction");
    
    // Add headings as main structure if available
    if (headings.length > 0) {
      outlineSections = [...outlineSections, ...headings];
    }
    
    // Add content gaps as sections (these are our competitive advantages)
    if (contentGaps.length > 0) {
      contentGaps.forEach(gap => {
        if (!outlineSections.includes(gap)) {
          outlineSections.push(gap);
        }
      });
    }
    
    // Add questions as sections or a FAQ section
    if (questions.length > 0) {
      if (questions.length <= 2) {
        questions.forEach(question => {
          if (!outlineSections.includes(question)) {
            outlineSections.push(question);
          }
        });
      } else {
        outlineSections.push("Frequently Asked Questions");
      }
    }
    
    // Add top stories if selected
    if (topStories.length > 0) {
      outlineSections.push("Latest News and Trends");
    }
    
    // Add related topics if we have keywords
    if (keywords.length > 0) {
      outlineSections.push("Related Topics and Considerations");
    }
    
    // Always add conclusion
    if (!outlineSections.includes("Conclusion")) {
      outlineSections.push("Conclusion");
    }
    
    // Set the outline in state
    dispatch({ type: 'SET_OUTLINE', payload: outlineSections });
    
    // Create an array of outline sections with IDs for the new table format
    const outlineSectionsWithIds = outlineSections.map(title => ({
      id: uuid(),
      title,
      level: 1,
    }));
    
    // Set the structured outline sections in state
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: outlineSectionsWithIds });
    
    // Navigate to the outline step
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    
    toast.success(`Generated strategic outline with ${outlineSections.length} sections based on your selected SERP elements`, {
      description: `Includes ${selectedItems.length} selected items: ${questions.length} questions, ${headings.length} headings, ${contentGaps.length} content gaps`
    });
  };
  
  return {
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
  };
};
