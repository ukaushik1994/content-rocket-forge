
import React from 'react';
import { ModernContentApproval } from './modern/ModernContentApproval';
import { useContent } from '@/contexts/content';
import { ApprovalProvider } from './context/ApprovalContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ContentApprovalView: React.FC = () => {
  const { contentItems } = useContent();
  const navigate = useNavigate();
  
  return (
    <ApprovalProvider>
      {/* Visual workflow explainer */}
      <Card className="mb-4 border-border/30 bg-background/40 backdrop-blur-sm">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">Create</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">Submit for Review</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Review Here</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium">Publish</span>
          </div>
        </CardContent>
      </Card>

      {contentItems.length === 0 && (
        <Card className="mb-6 border-border/50 bg-background/60 backdrop-blur-xl">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No content pending approval. Create content in AI Chat or the Content Wizard, then submit it for review.
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/ai-chat')}>
              Create Content <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}
      <ModernContentApproval contentItems={contentItems} />
    </ApprovalProvider>
  );
};
