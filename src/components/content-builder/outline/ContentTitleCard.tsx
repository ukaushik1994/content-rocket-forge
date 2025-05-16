
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Edit2, Check, X } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';

export const ContentTitleCard = () => {
  const { state, setContentTitle } = useContentBuilder();
  const { contentTitle, mainKeyword } = state;
  
  const [isEditing, setIsEditing] = useState(!contentTitle);
  const [titleInput, setTitleInput] = useState(contentTitle || '');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSaveTitle = () => {
    if (!titleInput.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    
    setContentTitle(titleInput);
    setIsEditing(false);
    toast.success("Content title saved");
  };

  const generateTitle = () => {
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return;
    }

    setIsGenerating(true);
    
    // Create different title patterns based on the keyword
    setTimeout(() => {
      const titles = [
        `Complete Guide to ${mainKeyword}: Everything You Need to Know`,
        `How to Master ${mainKeyword}: Step-by-Step Tutorial`,
        `${mainKeyword} 101: A Beginner's Guide`,
        `The Ultimate ${mainKeyword} Strategy for 2025`,
        `10 Proven ${mainKeyword} Techniques for Better Results`,
        `Why ${mainKeyword} Matters: An In-depth Analysis`
      ];
      
      setGeneratedTitles(titles);
      setIsGenerating(false);
    }, 800);
  };

  const selectGeneratedTitle = (title: string) => {
    setTitleInput(title);
    setContentTitle(title);
    setGeneratedTitles([]);
    setIsEditing(false);
    toast.success("Title selected and saved");
  };

  return (
    <Card className="border-border/40 bg-card">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">Content Title</h3>
            
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Enter your content title"
                  className="flex-1"
                />
                <Button onClick={handleSaveTitle}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
                {contentTitle && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setTitleInput(contentTitle);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
              
              <div>
                <Button
                  variant="secondary"
                  onClick={generateTitle}
                  disabled={isGenerating || !mainKeyword}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating Titles..." : "Generate Title Suggestions"}
                </Button>
              </div>
              
              {generatedTitles.length > 0 && (
                <div className="mt-4 space-y-2 bg-secondary/30 p-3 rounded-md">
                  <h4 className="text-sm font-medium">Suggested Titles:</h4>
                  <div className="space-y-2">
                    {generatedTitles.map((title, index) => (
                      <div 
                        key={index}
                        className="p-2 bg-background rounded-md border border-border/40 hover:border-primary/40 cursor-pointer transition-all"
                        onClick={() => selectGeneratedTitle(title)}
                      >
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-secondary/20 p-4 rounded-lg border border-border/20">
              <h3 className="text-lg font-medium">{contentTitle || "No title set"}</h3>
              {!contentTitle && (
                <p className="text-muted-foreground text-sm mt-1">
                  Click edit to set a title for your content
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
