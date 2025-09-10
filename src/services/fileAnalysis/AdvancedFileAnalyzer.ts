import { enhancedFileAnalysisService, EnhancedFileAnalysis } from '../enhancedFileAnalysis';

export class AdvancedFileAnalyzer {
  // Excel File Analysis
  async analyzeExcelFile(file: File): Promise<EnhancedFileAnalysis> {
    try {
      console.log('Analyzing Excel file:', file.name);
      const baseAnalysis = await enhancedFileAnalysisService.analyzeFile(file, 'advanced');
      
      return {
        ...baseAnalysis,
        insights: [
          ...(baseAnalysis.insights || []),
          'Excel file contains structured data suitable for analysis'
        ]
      };
    } catch (error) {
      console.error('Error analyzing Excel file:', error);
      throw error;
    }
  }

  // PowerPoint File Analysis
  async analyzePowerPointFile(file: File): Promise<EnhancedFileAnalysis> {
    try {
      console.log('Analyzing PowerPoint file:', file.name);
      const baseAnalysis = await enhancedFileAnalysisService.analyzeFile(file, 'advanced');
      
      return {
        ...baseAnalysis,
        insights: [
          ...(baseAnalysis.insights || []),
          'PowerPoint presentation analyzed for content structure'
        ]
      };
    } catch (error) {
      console.error('Error analyzing PowerPoint file:', error);
      throw error;
    }
  }

  // Image Analysis with Computer Vision and OCR
  async analyzeImageFile(file: File): Promise<EnhancedFileAnalysis> {
    try {
      console.log('Analyzing image file:', file.name);
      const baseAnalysis = await enhancedFileAnalysisService.analyzeFile(file, 'advanced');
      
      return {
        ...baseAnalysis,
        insights: [
          ...(baseAnalysis.insights || []),
          'Image analyzed with computer vision techniques'
        ]
      };
    } catch (error) {
      console.error('Error analyzing image file:', error);
      throw error;
    }
  }

  // Batch File Analysis
  async analyzeBatchFiles(files: File[]): Promise<Array<{
    file: File;
    analysis: EnhancedFileAnalysis;
    status: 'success' | 'error';
    error?: string;
  }>> {
    const results = [];
    
    for (const file of files) {
      try {
        const analysis = await this.analyzeFileByType(file);
        results.push({
          file,
          analysis,
          status: 'success' as const
        });
      } catch (error) {
        results.push({
          file,
          analysis: {} as EnhancedFileAnalysis,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  private async analyzeFileByType(file: File): Promise<EnhancedFileAnalysis> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return this.analyzeExcelFile(file);
      case 'pptx':
      case 'ppt':
        return this.analyzePowerPointFile(file);
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return this.analyzeImageFile(file);
      default:
        return enhancedFileAnalysisService.analyzeFile(file, 'advanced');
    }
  }
}

// Export singleton instance
export const advancedFileAnalyzer = new AdvancedFileAnalyzer();