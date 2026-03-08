
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Opportunity, type OpportunityBrief, opportunityHunterService } from '@/services/opportunityHunterService';
import { toast } from 'sonner';
import { FileText, Copy, ExternalLink, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BriefModalProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
}

export const BriefModal: React.FC<BriefModalProps> = ({
  opportunity,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [brief, setBrief] = useState<OpportunityBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBrief();
    }
  }, [isOpen, opportunity]);

  const loadBrief = async () => {
    try {
      setIsLoading(true);
      // First try to get existing briefs
      const briefs = await opportunityHunterService.getBriefsByOpportunityId(opportunity.id);
      if (briefs.length > 0) {
        setBrief(briefs[0]);
      } else {
        // Generate new brief if none exists
        const generatedBrief = await opportunityHunterService.generateBrief(opportunity.id);
        setBrief(generatedBrief);
      }
    } catch (error) {
      console.error('Error loading brief:', error);
      toast.error('Failed to load content brief');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBrief = async () => {
    try {
      setIsLoading(true);
      const generatedBrief = await opportunityHunterService.generateBrief(opportunity.id);
      setBrief(generatedBrief);
    } catch (error) {
      console.error('Error generating brief:', error);
      toast.error('Failed to generate content brief');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBrief = () => {
    if (brief?.content_brief) {
      navigator.clipboard.writeText(brief.content_brief);
      toast.success('Brief copied to clipboard');
    }
  };

  const handleUseInContentBuilder = () => {
    if (!brief) return;
    
    // Navigate to content builder with pre-populated data
    const briefData = {
      title: brief.title,
      keyword: opportunity.keyword,
      outline: brief.outline,
      introduction: brief.introduction,
      faq: brief.faq_section,
      metaTitle: brief.meta_title,
      metaDescription: brief.meta_description,
      wordCount: brief.target_word_count
    };

    // Store brief data in localStorage for content builder
    localStorage.setItem('contentBrief', JSON.stringify(briefData));
    
    // Navigate to content wizard
    navigate('/ai-chat');
    onClose();
    
    toast.success('Brief loaded into Content Wizard');
  };

  const handleAddToCalendar = async () => {
    try {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 7);
      await opportunityHunterService.addToCalendar(opportunity.id, scheduledDate.toISOString().split('T')[0]);
      toast.success('Added to content calendar');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast.error('Failed to add to calendar');
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-background border-white/10">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-neon-purple border-t-transparent rounded-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-background border-white/10 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-neon-purple" />
            Content Brief: {opportunity.keyword}
          </DialogTitle>
          <DialogDescription>
            AI-generated content brief for your opportunity
          </DialogDescription>
        </DialogHeader>

        {brief && (
          <div className="space-y-6">
            {/* Brief Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{brief.content_type}</Badge>
                <Badge variant="outline">{brief.format}</Badge>
                {brief.target_word_count && (
                  <Badge variant="outline">{brief.target_word_count} words</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBrief}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCalendar}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
                <Button
                  size="sm"
                  onClick={handleUseInContentBuilder}
                  className="bg-neon-purple hover:bg-neon-blue text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Use in Content Builder
                </Button>
              </div>
            </div>

            {/* Brief Content */}
            <Tabs defaultValue="preview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-glass border border-white/10">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="outline">Outline</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="meta">SEO Meta</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <Card className="border-white/10 bg-glass">
                  <CardHeader>
                    <CardTitle className="text-xl">{brief.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {brief.introduction && (
                      <div>
                        <h4 className="font-medium mb-2">Introduction</h4>
                        <p className="text-muted-foreground">{brief.introduction}</p>
                      </div>
                    )}
                    {brief.content_brief && (
                      <div>
                        <h4 className="font-medium mb-2">Full Brief</h4>
                        <div className="prose prose-sm max-w-none text-muted-foreground">
                          <pre className="whitespace-pre-wrap font-sans text-sm">
                            {brief.content_brief}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outline">
                <Card className="border-white/10 bg-glass">
                  <CardHeader>
                    <CardTitle>Content Outline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {brief.outline && brief.outline.length > 0 ? (
                      <ol className="space-y-2">
                        {brief.outline.map((section, index) => (
                          <li key={index} className="flex items-start">
                            <span className="bg-neon-purple text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </span>
                            <span>{section}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-muted-foreground">No outline available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq">
                <Card className="border-white/10 bg-glass">
                  <CardHeader>
                    <CardTitle>FAQ Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {brief.faq_section && brief.faq_section.length > 0 ? (
                      <div className="space-y-4">
                        {brief.faq_section.map((faq, index) => (
                          <div key={index} className="border-l-2 border-neon-purple pl-4">
                            <h4 className="font-medium mb-2">{faq.question}</h4>
                            <p className="text-muted-foreground text-sm">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No FAQ available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="meta">
                <Card className="border-white/10 bg-glass">
                  <CardHeader>
                    <CardTitle>SEO Meta Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {brief.meta_title && (
                      <div>
                        <h4 className="font-medium mb-2">Meta Title</h4>
                        <p className="text-muted-foreground bg-white/5 p-3 rounded border">
                          {brief.meta_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {brief.meta_title.length} characters
                        </p>
                      </div>
                    )}
                    {brief.meta_description && (
                      <div>
                        <h4 className="font-medium mb-2">Meta Description</h4>
                        <p className="text-muted-foreground bg-white/5 p-3 rounded border">
                          {brief.meta_description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {brief.meta_description.length} characters
                        </p>
                      </div>
                    )}
                    {brief.target_word_count && (
                      <div>
                        <h4 className="font-medium mb-2">Target Word Count</h4>
                        <p className="text-muted-foreground">{brief.target_word_count} words</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
