import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Globe, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as competitorIntelService from '@/services/competitorIntelService';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface AddCompetitorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (data: CompetitorAutoFillPayload, name: string, website: string) => void;
  userId: string;
}

export const AddCompetitorDialog: React.FC<AddCompetitorDialogProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
  userId
}) => {
  const [website, setWebsite] = useState('');
  const [name, setName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const { toast } = useToast();

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const normalizeUrl = (url: string): string => {
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const handleAnalyze = async () => {
    if (!website.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(website)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL (e.g., competitor.com)",
        variant: "destructive"
      });
      return;
    }

    const normalizedUrl = normalizeUrl(website);
    setIsAnalyzing(true);
    setAnalysisProgress('🔍 Discovering pages...');

    try {
      // Simulate progress updates
      setTimeout(() => setAnalysisProgress('📊 Analyzing content...'), 5000);
      setTimeout(() => setAnalysisProgress('🧠 Extracting intelligence...'), 15000);
      setTimeout(() => setAnalysisProgress('✨ Finalizing profile...'), 25000);

      const result = await competitorIntelService.autoFillFromWebsite(normalizedUrl, userId);

      if (!result) {
        toast({
          title: "Analysis Failed",
          description: "Could not analyze the website. Please try again or enter details manually.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        setAnalysisProgress('');
        return;
      }

      // Extract name from URL if not provided
      const competitorName = name.trim() || new URL(normalizedUrl).hostname.replace('www.', '').split('.')[0];
      
      toast({
        title: "✅ Analysis Complete!",
        description: "Review and customize the extracted intelligence",
      });

      onAnalysisComplete(result, competitorName, normalizedUrl);
      handleClose();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "An error occurred during analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handleClose = () => {
    setWebsite('');
    setName('');
    setAnalysisProgress('');
    setIsAnalyzing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-panel max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Competitor with AI Analysis
          </DialogTitle>
        </DialogHeader>

        {!isAnalyzing ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Competitor Website URL *
              </Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="competitor.com or https://competitor.com"
                disabled={isAnalyzing}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <p className="text-xs text-muted-foreground">
                We'll automatically analyze their website and extract competitive intelligence
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Competitor Name (optional)
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Auto-detected from website"
                disabled={isAnalyzing}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">We'll automatically extract:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  Description & market position
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  Strengths & weaknesses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  Key resources & links
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  Competitive intelligence summary
                </li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2">
                ⏱️ Analysis takes 30-45 seconds
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isAnalyzing}>
                Cancel
              </Button>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Competitor
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-lg">Analyzing Competitor</h4>
                <p className="text-sm text-muted-foreground animate-pulse">
                  {analysisProgress}
                </p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                This may take 30-45 seconds. We're crawling their website, analyzing content, and extracting competitive intelligence using AI.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
