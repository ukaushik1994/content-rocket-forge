import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Loader2, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export function TitleGenerationButton() {
  const { state, setContentTitle } = useContentBuilder();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  
  const generateTitles = async () => {
    setIsLoading(true);
    
    // Simulate title generation (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generated = [
      `Compelling Title 1 for ${state.mainKeyword}`,
      `Amazing Title 2 about ${state.mainKeyword}`,
      `Catchy Title 3 on ${state.mainKeyword}`
    ];
    
    setGeneratedTitles(generated);
    setIsLoading(false);
    toast.success("Generated title suggestions!");
  };
  
  const applyTitle = (title: string) => {
    setContentTitle(title);
    toast.success(`Applied title: ${title}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Titles
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Suggested Titles</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {generatedTitles.length > 0 ? (
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {generatedTitles.map((title, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors duration-200 flex items-center justify-between"
                    onClick={() => applyTitle(title)}
                  >
                    {title}
                    <Check className="h-4 w-4 ml-2" />
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground">
              No titles generated yet.
            </div>
          )}
        </div>
        <Button variant="outline" className="w-full" onClick={generateTitles} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Titles
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

