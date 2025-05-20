
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFormatByIdOrDefault } from './formats';
import { Copy, Download, Save, Trash } from 'lucide-react';
import FormatSelector from './generated-content/FormatSelector';
import ContentViewer from './generated-content/ContentViewer';
import ContentStats from './generated-content/ContentStats';
import PreviewModeToggle from './generated-content/PreviewModeToggle';
import NoContentDisplay from './generated-content/NoContentDisplay';
import SelectFormatDisplay from './generated-content/SelectFormatDisplay';

interface GeneratedContentDisplayProps {
  generatedContents: Record<string, string>;
  activeFormat: string | null;
  onFormatChange: (formatId: string) => void;
  onCopy: (text: string) => void;
  onDownload: (text: string, formatName: string) => void;
  onSave: (formatId: string, content: string) => Promise<boolean>;
  onDelete: (formatId: string) => Promise<boolean>;
  isDeleting: boolean;
  isSaving: boolean;
  savedFormats: string[];
}

const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({
  generatedContents,
  activeFormat,
  onFormatChange,
  onCopy,
  onDownload,
  onSave,
  onDelete,
  isDeleting,
  isSaving,
  savedFormats
}) => {
  const [previewMode, setPreviewMode] = useState<boolean>(true);
  
  // Check if we have content to display
  const hasContent = Object.keys(generatedContents).length > 0;
  
  // Get active format content
  const activeContent = activeFormat ? generatedContents[activeFormat] : '';
  const formatInfo = activeFormat ? getFormatByIdOrDefault(activeFormat) : null;
  const isFormatSaved = activeFormat ? savedFormats.includes(activeFormat) : false;
  
  const handleCopy = () => {
    if (activeContent) {
      onCopy(activeContent);
    }
  };
  
  const handleDownload = () => {
    if (activeContent && formatInfo) {
      onDownload(activeContent, formatInfo.name);
    }
  };
  
  const handleSave = async () => {
    if (activeContent && activeFormat) {
      await onSave(activeFormat, activeContent);
    }
  };
  
  const handleDelete = async () => {
    if (activeFormat) {
      await onDelete(activeFormat);
    }
  };
  
  if (!hasContent) {
    return <NoContentDisplay />;
  }
  
  if (!activeFormat) {
    return <SelectFormatDisplay onSelect={onFormatChange} formats={Object.keys(generatedContents)} />;
  }
  
  return (
    <Card>
      <CardHeader className="flex-row flex justify-between items-center space-y-0 pb-2">
        <CardTitle className="text-lg">Generated Content</CardTitle>
        <div className="flex space-x-2">
          <PreviewModeToggle 
            isPreviewMode={previewMode} 
            onToggle={() => setPreviewMode(!previewMode)} 
          />
          <FormatSelector 
            generatedFormats={Object.keys(generatedContents)} 
            activeFormat={activeFormat}
            setActiveFormat={onFormatChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        {activeFormat && activeContent && (
          <>
            <ContentStats content={activeContent} formatId={activeFormat} />
            <ContentViewer 
              content={activeContent} 
              formatId={activeFormat} 
              previewMode={previewMode} 
            />
            
            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button 
                  size="sm" 
                  variant={isFormatSaved ? "outline" : "default"} 
                  onClick={handleSave}
                  disabled={isSaving || isFormatSaved}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isFormatSaved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedContentDisplay;
