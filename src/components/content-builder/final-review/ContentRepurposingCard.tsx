
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Undo, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ContentRepurposingCardProps {
  content: string;
  title: string;
  onRepurpose?: () => void;
}

export const ContentRepurposingCard: React.FC<ContentRepurposingCardProps> = ({ 
  content, 
  title,
  onRepurpose = () => {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleRepurposeClick = () => {
    if (typeof onRepurpose === 'function') {
      onRepurpose();
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-primary" />
            Content Repurposing
          </span>
          <Badge variant="outline" className="ml-2">New</Badge>
        </CardTitle>
        <CardDescription>
          Transform your content into different formats for various platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 text-sm">
        <p>Repurpose your content into:</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary">Social posts</Badge>
          <Badge variant="secondary">Email newsletter</Badge>
          <Badge variant="secondary">Video script</Badge>
          <Badge variant="secondary">Podcast script</Badge>
          <Badge variant="secondary">Infographic</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleRepurposeClick}
        >
          <Undo className="h-3.5 w-3.5 mr-1.5" />
          Repurpose Content
        </Button>
      </CardFooter>
    </Card>
  );
};
