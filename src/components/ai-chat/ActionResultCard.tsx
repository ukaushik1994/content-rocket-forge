import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionResult {
  success: boolean;
  message: string;
  action?: string;
  navigateUrl?: string;
  navigateLabel?: string;
  details?: string;
}

interface ActionResultCardProps {
  result: ActionResult;
  onNavigate?: (url: string) => void;
  onFollowUp?: (message: string) => void;
}

export const ActionResultCard: React.FC<ActionResultCardProps> = ({
  result,
  onNavigate,
  onFollowUp
}) => {
  const isSuccess = result.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "p-4 border-l-2 bg-transparent",
        isSuccess 
          ? "border-l-emerald-500 border-border/20" 
          : "border-l-destructive border-border/20"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex-shrink-0 mt-0.5",
            isSuccess ? "text-emerald-500" : "text-destructive"
          )}>
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-1.5 py-0 border-transparent",
                  isSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                )}
              >
                {isSuccess ? 'Success' : 'Failed'}
              </Badge>
              {result.action && (
                <span className="text-xs text-muted-foreground">{result.action}</span>
              )}
            </div>
            
            <p className="text-sm text-foreground/80">{result.message}</p>
            
            {result.details && (
              <p className="text-xs text-muted-foreground">{result.details}</p>
            )}
            
            <div className="flex gap-2 pt-1">
              {result.navigateUrl && onNavigate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(result.navigateUrl!)}
                  className="h-7 text-xs gap-1 border-border/20 hover:border-border/40"
                >
                  <ExternalLink className="w-3 h-3" />
                  {result.navigateLabel || 'View'}
                </Button>
              )}
              {onFollowUp && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFollowUp(`What else can I do with this ${result.action || 'result'}?`)}
                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                >
                  <MessageSquare className="w-3 h-3" />
                  Follow up
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Utility to detect action results in AI response content
export const parseActionResults = (content: string): ActionResult[] => {
  const results: ActionResult[] = [];
  
  // Match JSON-like action result patterns in the content
  const patterns = [
    /✅\s*(.+?)(?:\n|$)/g,  // Success pattern: ✅ message
    /❌\s*(.+?)(?:\n|$)/g,  // Failure pattern: ❌ message
  ];
  
  // Check for success indicators
  const successMatches = content.matchAll(/✅\s*(.+?)(?:\n|$)/g);
  for (const match of successMatches) {
    results.push({
      success: true,
      message: match[1].trim(),
    });
  }
  
  // Check for failure indicators
  const failureMatches = content.matchAll(/❌\s*(.+?)(?:\n|$)/g);
  for (const match of failureMatches) {
    results.push({
      success: false,
      message: match[1].trim(),
    });
  }
  
  return results;
};
