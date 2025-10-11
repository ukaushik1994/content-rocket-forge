import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { 
  History, 
  Clock, 
  Eye, 
  GitCompare,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AnalysisVersion {
  id: string;
  version_number: number;
  title: string;
  charts_data: any;
  insights: any;
  actionable_items: any;
  deep_dive_prompts: any;
  change_summary: string;
  created_at: string;
}

interface AnalysisVersionHistoryProps {
  analysisId: string;
  onLoadVersion: (version: AnalysisVersion) => void;
  onCompareVersions: (v1: AnalysisVersion, v2: AnalysisVersion) => void;
  onClose: () => void;
}

export const AnalysisVersionHistory: React.FC<AnalysisVersionHistoryProps> = ({
  analysisId,
  onLoadVersion,
  onCompareVersions,
  onClose
}) => {
  const [versions, setVersions] = useState<AnalysisVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadVersions();
  }, [analysisId]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_chart_analyses_versions')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error: any) {
      console.error('Error loading versions:', error);
      toast({
        title: "Error loading versions",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        toast({
          title: "Maximum selections",
          description: "You can only compare 2 versions at a time",
          variant: "default"
        });
        return prev;
      }
      return [...prev, versionId];
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length !== 2) {
      toast({
        title: "Select 2 versions",
        description: "Please select exactly 2 versions to compare",
        variant: "default"
      });
      return;
    }

    const v1 = versions.find(v => v.id === selectedVersions[0]);
    const v2 = versions.find(v => v.id === selectedVersions[1]);

    if (v1 && v2) {
      onCompareVersions(v1, v2);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Version History</h3>
          <Badge variant="secondary">{versions.length}</Badge>
        </div>
        <div className="flex gap-2">
          {selectedVersions.length === 2 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCompare}
              className="gap-2"
            >
              <GitCompare className="w-4 h-4" />
              Compare
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No version history yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Versions are automatically created when you update an analysis
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {versions.map((version, idx) => {
              const isSelected = selectedVersions.includes(version.id);
              const isLatest = idx === 0;
              
              return (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => toggleVersionSelection(version.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          Version {version.version_number}
                        </span>
                        {isLatest && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            Selected
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {version.change_summary || 'Auto-saved version'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(version.created_at), 'MMM d, yyyy HH:mm')}</span>
                        </div>
                        {version.charts_data && (
                          <span>
                            {Array.isArray(version.charts_data) ? version.charts_data.length : 0} chart{Array.isArray(version.charts_data) && version.charts_data.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadVersion(version);
                      }}
                      className="flex-shrink-0"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {selectedVersions.length > 0 && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {selectedVersions.length === 1 
              ? '1 version selected. Select one more to compare.' 
              : '2 versions selected. Click "Compare" to see differences.'}
          </p>
        </div>
      )}
    </Card>
  );
};
