
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, FileCheck, FileText, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContentWritingHeaderProps {
  showOutline: boolean;
  showGenerator: boolean;
  handleToggleOutline: () => void;
  handleToggleGenerator: () => void;
  mainKeyword: string;
  setShowSaveDialog: (show: boolean) => void;
}

export const ContentWritingHeader: React.FC<ContentWritingHeaderProps> = ({
  showOutline,
  showGenerator,
  handleToggleOutline,
  handleToggleGenerator,
  mainKeyword,
  setShowSaveDialog
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Edit className="h-5 w-5 text-primary" />
          Content Writing
          {mainKeyword && (
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
              {mainKeyword}
            </Badge>
          )}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Write and edit your content based on your outline
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleOutline}
          className={showOutline ? 'bg-primary/10 border-primary/30' : ''}
        >
          <List className="h-4 w-4 mr-2" />
          {showOutline ? 'Hide Outline' : 'Show Outline'}
        </Button>
        
        <Button
          variant="outline"
          size="sm" 
          onClick={handleToggleGenerator}
          className={showGenerator ? 'bg-primary/10 border-primary/30' : ''}
        >
          <FileText className="h-4 w-4 mr-2" />
          {showGenerator ? 'Hide Generator' : 'AI Generator'}
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
        >
          <FileCheck className="h-4 w-4 mr-2" />
          Save Content
        </Button>
      </div>
    </div>
  );
};
