
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { contentFormats } from './formats';
import FormatInfoCard from './format-selection/FormatInfoCard';
import BulkOperationsBar from './format-selection/BulkOperationsBar';
import GenerationProgress from './format-selection/GenerationProgress';

interface ContentFormatSelectionProps {
  selectedFormats: string[];
  setSelectedFormats: (formats: string[]) => void;
  onGenerateContent: (formats: string[]) => void;
  isGenerating?: boolean;
  generatedContents?: Record<string, string>;
  onSaveAllContent?: () => Promise<boolean>;
  onExportAll?: () => void;
  onCopyAll?: () => void;
  isSaving?: boolean;
  selectedPersonas?: string[];
  availablePersonas?: any[];
}

export const ContentFormatSelection: React.FC<ContentFormatSelectionProps> = ({
  selectedFormats,
  setSelectedFormats,
  onGenerateContent,
  isGenerating = false,
  generatedContents = {},
  onSaveAllContent,
  onExportAll,
  onCopyAll,
  isSaving = false,
  selectedPersonas = [],
  availablePersonas = []
}) => {
  const [showProgress, setShowProgress] = useState(false);
  
  // No progress data without real generation tracking
  const [formatProgresses, setFormatProgresses] = useState<any[]>([]);
  
  const toggleFormatSelection = (formatId: string) => {
    if (selectedFormats.includes(formatId)) {
      setSelectedFormats(selectedFormats.filter(id => id !== formatId));
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedFormats.length === contentFormats.length) {
      setSelectedFormats([]);
    } else {
      setSelectedFormats(contentFormats.map(f => f.id));
    }
  };
  
  const handleGenerateContent = () => {
    if (selectedFormats.length === 0) return;
    
    // Call the actual generate function
    onGenerateContent(selectedFormats);
  };
  
  const generatedFormatsCount = Object.keys(generatedContents).length;
  
  return (
    <Card className="h-full border-white/10 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-white/10">
        <CardTitle className="text-lg text-white font-semibold">Content Formats</CardTitle>
        <CardDescription className="text-white/70">
          {selectedPersonas.length > 0 
            ? `Generate content for ${selectedPersonas.length} persona${selectedPersonas.length !== 1 ? 's' : ''}`
            : 'Select formats to generate repurposed content'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        {showProgress && isGenerating ? (
          <GenerationProgress 
            formatProgresses={formatProgresses}
            isVisible={showProgress} 
          />
        ) : (
          <>
            <BulkOperationsBar 
              selectedCount={selectedFormats.length}
              totalCount={contentFormats.length}
              generatedCount={generatedFormatsCount}
              onSelectAll={handleSelectAll}
              onClearAll={() => setSelectedFormats([])}
              onSaveAll={onSaveAllContent}
              onExportAll={onExportAll}
              onCopyAll={onCopyAll}
              isLoading={isGenerating}
              isSaving={isSaving}
            />
            
            <ScrollArea className="h-[280px] mt-4 pr-4">
              <div className="grid grid-cols-1 gap-3">
                {contentFormats.map((format) => (
                  <div 
                    key={format.id}
                    className="relative cursor-pointer"
                    onClick={() => toggleFormatSelection(format.id)}
                  >
                    <FormatInfoCard 
                      format={format} 
                      isRecommended={false}
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <div 
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          selectedFormats.includes(format.id) 
                            ? 'bg-primary border-primary shadow-lg' 
                            : 'bg-card border-border hover:border-primary/50 shadow-sm'
                        }`}
                      >
                        {selectedFormats.includes(format.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-white/10 bg-black/20">
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg border-0 transition-all duration-300"
          disabled={selectedFormats.length === 0 || isGenerating}
          onClick={handleGenerateContent}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {selectedFormats.length > 0 && selectedPersonas.length > 0
                ? `Generating ${selectedFormats.length} format${selectedFormats.length !== 1 ? 's' : ''} for ${selectedPersonas.length} persona${selectedPersonas.length !== 1 ? 's' : ''}...`
                : selectedFormats.length > 0 
                  ? `Generating ${selectedFormats.length} format${selectedFormats.length !== 1 ? 's' : ''}...` 
                  : 'Generating...'}
            </>
          ) : (
            <>
              {selectedFormats.length > 0 && selectedPersonas.length > 0
                ? `Generate ${selectedFormats.length} format${selectedFormats.length !== 1 ? 's' : ''} for ${selectedPersonas.length} persona${selectedPersonas.length !== 1 ? 's' : ''}`
                : selectedFormats.length > 0 
                  ? `Generate ${selectedFormats.length} format${selectedFormats.length !== 1 ? 's' : ''}` 
                  : 'Select formats to generate'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentFormatSelection;
