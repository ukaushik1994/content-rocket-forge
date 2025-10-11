import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  Calendar, 
  Trash2, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SavedAnalysis {
  id: string;
  title: string;
  charts_data: any;
  insights: any;
  actionable_items: any;
  deep_dive_prompts: any;
  context: any;
  created_at: string;
  updated_at: string;
}

interface SavedAnalysesListProps {
  onLoad: (analysis: SavedAnalysis) => void;
  onClose: () => void;
  currentAnalysisId?: string | null;
}

export const SavedAnalysesList: React.FC<SavedAnalysesListProps> = ({
  onLoad,
  onClose,
  currentAnalysisId
}) => {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view saved analyses",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('saved_chart_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      console.error('Error loading analyses:', error);
      toast({
        title: "Error loading analyses",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeleting(id);
    try {
      const { error } = await supabase
        .from('saved_chart_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Analysis deleted",
        description: `"${title}" has been removed`
      });
    } catch (error: any) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "Error deleting analysis",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
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
          <FolderOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Saved Analyses</h3>
          <Badge variant="secondary">{analyses.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No saved analyses yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create and save chart analyses to see them here
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {analyses.map((analysis, idx) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className={`p-4 hover:shadow-md transition-all cursor-pointer ${
                    currentAnalysisId === analysis.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => onLoad(analysis)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold truncate">{analysis.title}</h4>
                        {currentAnalysisId === analysis.id && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(analysis.updated_at), 'MMM d, yyyy')}</span>
                        </div>
                        {analysis.charts_data && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{Array.isArray(analysis.charts_data) ? analysis.charts_data.length : 0} chart{Array.isArray(analysis.charts_data) && analysis.charts_data.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(analysis.id, analysis.title);
                      }}
                      disabled={deleting === analysis.id}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
