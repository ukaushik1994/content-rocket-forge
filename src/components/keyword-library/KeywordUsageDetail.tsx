import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, FileText, Book, Target, ExternalLink } from 'lucide-react';
import { keywordLibraryService } from '@/services/keywordLibraryService';

interface KeywordUsageDetailProps {
  keywordId: string;
  usageCount: number;
}

export const KeywordUsageDetail: React.FC<KeywordUsageDetailProps> = ({
  keywordId,
  usageCount
}) => {
  const [usageDetails, setUsageDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadUsageDetails = async () => {
    if (loading || usageDetails.length > 0) return;
    
    try {
      setLoading(true);
      const details = await keywordLibraryService.getDetailedKeywordUsage(keywordId);
      setUsageDetails(details);
    } catch (error) {
      console.error('Error loading usage details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'content_item': return <FileText className="h-3 w-3" />;
      case 'glossary_term': return <Book className="h-3 w-3" />;
      case 'strategy': return <Target className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getUsageTypeColor = (usageType: string) => {
    switch (usageType) {
      case 'primary': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'secondary': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'serp_extracted': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (usageCount === 0) {
    return (
      <Badge variant="secondary" className="text-xs">
        0
      </Badge>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 hover:bg-primary/10"
          onClick={loadUsageDetails}
        >
          <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20">
            {usageCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Usage Details</h4>
            <Badge variant="outline" className="text-xs">
              {usageCount} {usageCount === 1 ? 'use' : 'uses'}
            </Badge>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
              <p className="text-xs text-muted-foreground mt-2">Loading details...</p>
            </div>
          ) : usageDetails.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {usageDetails.map((usage, index) => (
                <div key={index} className="border border-white/10 rounded-lg p-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getContentTypeIcon(usage.content_type)}
                      <span className="text-xs font-medium">
                        {usage.content_items?.title || usage.glossary_terms?.term || 'Unknown'}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getUsageTypeColor(usage.usage_type)}`}
                    >
                      {usage.usage_type}
                    </Badge>
                  </div>
                  
                  {usage.content_items?.status && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Status: {usage.content_items.status}</span>
                      {usage.content_items.content_type && (
                        <>
                          <span>•</span>
                          <span>Type: {usage.content_items.content_type}</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {usage.solution_mapping && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>Solution: {Array.isArray(usage.solution_mapping) 
                          ? usage.solution_mapping.join(', ') 
                          : usage.solution_mapping}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(usage.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">No usage details found</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};