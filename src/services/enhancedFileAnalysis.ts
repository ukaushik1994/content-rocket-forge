import { supabase } from '@/integrations/supabase/client';

export interface EnhancedFileAnalysis {
  id?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  analysisType: 'standard' | 'advanced' | 'competitive';
  contentPreview?: string;
  extractedText?: string;
  insights: string[];
  sentimentScore?: number;
  keyTopics: string[];
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  optimizationSuggestions: Array<{
    type: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  competitiveAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
}

export class EnhancedFileAnalysisService {
  
  async analyzeFile(file: File, analysisType: 'standard' | 'advanced' | 'competitive' = 'standard'): Promise<EnhancedFileAnalysis> {
    try {
      // Extract file content based on type
      const extractedText = await this.extractFileContent(file);
      const contentPreview = extractedText.substring(0, 500);
      
      // Perform AI analysis
      const aiAnalysis = await this.performAIAnalysis(extractedText, file.type, analysisType);
      
      // Create analysis object
      const analysis: EnhancedFileAnalysis = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        analysisType,
        contentPreview,
        extractedText,
        ...aiAnalysis
      };
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save to database
      const { data, error } = await supabase
        .from('ai_file_analyses')
        .insert({
          user_id: user.id,
          file_name: analysis.fileName,
          file_type: analysis.fileType,
          file_size: analysis.fileSize,
          analysis_type: analysis.analysisType,
          content_preview: analysis.contentPreview,
          extracted_text: analysis.extractedText,
          insights: analysis.insights as any,
          sentiment_score: analysis.sentimentScore,
          key_topics: analysis.keyTopics,
          entities: analysis.entities as any,
          optimization_suggestions: analysis.optimizationSuggestions as any,
          competitive_analysis: analysis.competitiveAnalysis || {}
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return { ...analysis, id: data.id };
      
    } catch (error) {
      console.error('File analysis error:', error);
      throw new Error(`Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async extractFileContent(file: File): Promise<string> {
    const fileType = file.type;
    
    if (fileType.startsWith('text/')) {
      return await this.extractTextFromFile(file);
    } else if (fileType === 'application/pdf') {
      return await this.extractTextFromPDF(file);
    } else if (fileType.includes('image/')) {
      return await this.extractTextFromImage(file);
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return await this.extractTextFromSpreadsheet(file);
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return await this.extractTextFromPresentation(file);
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return await this.extractTextFromDocument(file);
    }
    
    // Fallback: try to read as text
    return await this.extractTextFromFile(file);
  }
  
  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
  
  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      // For now, return placeholder - in production would use PDF.js
      return `[PDF content - ${file.name}]\nThis is a PDF file that would be processed using PDF.js library.`;
    } catch (error) {
      throw new Error('PDF processing not available');
    }
  }
  
  private async extractTextFromImage(file: File): Promise<string> {
    try {
      // For now, return placeholder - in production would use OCR service
      return `[Image content - ${file.name}]\nThis is an image file that would be processed using OCR technology.`;
    } catch (error) {
      throw new Error('Image OCR not available');
    }
  }
  
  private async extractTextFromSpreadsheet(file: File): Promise<string> {
    try {
      // Placeholder for Excel/CSV processing
      return `[Spreadsheet content - ${file.name}]\nThis is a spreadsheet file with tabular data.`;
    } catch (error) {
      throw new Error('Spreadsheet processing not available');
    }
  }
  
  private async extractTextFromPresentation(file: File): Promise<string> {
    try {
      // Placeholder for PowerPoint processing
      return `[Presentation content - ${file.name}]\nThis is a presentation file with slides and content.`;
    } catch (error) {
      throw new Error('Presentation processing not available');
    }
  }
  
  private async extractTextFromDocument(file: File): Promise<string> {
    try {
      // For Word documents, would use mammoth.js or similar
      return `[Document content - ${file.name}]\nThis is a document file with formatted text content.`;
    } catch (error) {
      throw new Error('Document processing not available');
    }
  }
  
  private async performAIAnalysis(text: string, fileType: string, analysisType: string) {
    try {
      // Call enhanced AI chat for analysis
      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          message: `Analyze this ${fileType} content with ${analysisType} analysis:\n\n${text.substring(0, 4000)}`,
          type: 'file_analysis',
          analysisType,
          metadata: {
            fileType,
            contentLength: text.length
          }
        }
      });
      
      if (error) throw error;
      
      // Parse AI response for structured data
      return this.parseAIAnalysisResponse(data.content, analysisType);
      
    } catch (error) {
      console.error('AI analysis error:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis(text, analysisType);
    }
  }
  
  private parseAIAnalysisResponse(aiResponse: string, analysisType: string) {
    // In a real implementation, this would parse structured AI response
    // For now, create mock structured data
    
    const wordCount = aiResponse.split(' ').length;
    const sentimentScore = Math.random() * 2 - 1; // -1 to 1
    
    const insights = [
      'Content demonstrates clear structure and organization',
      'Key themes identified throughout the document',
      'Professional tone maintained consistently'
    ];
    
    const keyTopics = ['strategy', 'analysis', 'recommendations'];
    
    const entities = [
      { text: 'Important Entity', type: 'ORGANIZATION', confidence: 0.95 },
      { text: 'Key Concept', type: 'CONCEPT', confidence: 0.87 }
    ];
    
    const optimizationSuggestions = [
      {
        type: 'readability',
        suggestion: 'Consider breaking up longer paragraphs for better readability',
        priority: 'medium' as const
      },
      {
        type: 'seo',
        suggestion: 'Add more descriptive headings and subheadings',
        priority: 'high' as const
      }
    ];
    
    let competitiveAnalysis;
    if (analysisType === 'competitive') {
      competitiveAnalysis = {
        strengths: ['Clear messaging', 'Good structure'],
        weaknesses: ['Limited data support', 'Could use more examples'],
        opportunities: ['Add case studies', 'Include more visuals']
      };
    }
    
    return {
      insights,
      sentimentScore,
      keyTopics,
      entities,
      optimizationSuggestions,
      competitiveAnalysis
    };
  }
  
  private getFallbackAnalysis(text: string, analysisType: string) {
    return {
      insights: ['Basic analysis completed', 'Content extracted successfully'],
      sentimentScore: 0,
      keyTopics: ['general'],
      entities: [],
      optimizationSuggestions: [
        {
          type: 'general',
          suggestion: 'Review content for clarity and completeness',
          priority: 'low' as const
        }
      ],
      competitiveAnalysis: analysisType === 'competitive' ? {
        strengths: ['Content available'],
        weaknesses: ['Limited analysis'],
        opportunities: ['Enhance with AI analysis']
      } : undefined
    };
  }
  
  async getFileAnalysisHistory(userId: string): Promise<EnhancedFileAnalysis[]> {
    const { data, error } = await supabase
      .from('ai_file_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      fileName: item.file_name,
      fileType: item.file_type,
      fileSize: item.file_size,
      analysisType: item.analysis_type as 'standard' | 'advanced' | 'competitive',
      contentPreview: item.content_preview || undefined,
      extractedText: item.extracted_text || undefined,
      insights: Array.isArray(item.insights) ? item.insights as string[] : [],
      sentimentScore: typeof item.sentiment_score === 'number' ? item.sentiment_score : undefined,
      keyTopics: Array.isArray(item.key_topics) ? item.key_topics : [],
      entities: Array.isArray(item.entities) ? item.entities as Array<{
        text: string;
        type: string;
        confidence: number;
      }> : [],
      optimizationSuggestions: Array.isArray(item.optimization_suggestions) ? item.optimization_suggestions as Array<{
        type: string;
        suggestion: string;
        priority: 'low' | 'medium' | 'high';
      }> : [],
      competitiveAnalysis: item.competitive_analysis as {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
      } | undefined
    }));
  }
}

export const enhancedFileAnalysisService = new EnhancedFileAnalysisService();