
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
      {contentItems.length === 0 && (
        <Card className="mb-6 border-border/50 bg-background/60 backdrop-blur-xl">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Create content in the Content Builder to start the approval workflow.
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/content-type-selection')}>
              Create Content <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}
      <ModernContentApproval contentItems={contentItems} />
    </ApprovalProvider>
  );
};
