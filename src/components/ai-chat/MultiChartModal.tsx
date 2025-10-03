import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VisualData, ChartConfiguration } from '@/types/enhancedChat';
import { InteractiveChart } from './InteractiveChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Download, Maximize2, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MultiChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  visualDataArray: VisualData[];
  title?: string;
}

export const MultiChartModal: React.FC<MultiChartModalProps> = ({
  isOpen,
  onClose,
  visualDataArray,
  title = 'Data Visualization'
}) => {
  console.log('📊 MultiChartModal: Rendering with data:', {
    isOpen,
    dataCount: visualDataArray.length,
    types: visualDataArray.map(d => d.type)
  });

  const handleExportAll = () => {
    const exportData = {
      title,
      timestamp: new Date().toISOString(),
      visualizations: visualDataArray
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `multi-chart-export-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderMetricCards = (metrics: any[]) => {
    return (
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon && (LucideIcons[metric.icon as keyof typeof LucideIcons] as LucideIcon | undefined);
          
          return (
            <Card key={metric.id} className="glass-panel bg-glass border border-white/10 p-4 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {IconComponent ? (
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold">
                      {typeof metric.value === 'string' ? metric.value : metric.value?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
                
                {metric.change && (
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                    metric.change.type === 'increase' 
                      ? "bg-success/20 text-success" 
                      : "bg-destructive/20 text-destructive"
                  )}>
                    {metric.change.type === 'increase' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{metric.change.value}%</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderChartSection = (visualData: VisualData, index: number) => {
    if (visualData.type === 'metrics' && visualData.metrics) {
      return (
        <div key={index} className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Key Metrics
          </h3>
          {renderMetricCards(visualData.metrics)}
        </div>
      );
    }

    if (visualData.type === 'chart' && visualData.chartConfig) {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="mb-6"
        >
          <InteractiveChart
            chartConfig={visualData.chartConfig}
            title={(visualData as any).title || `Chart ${index + 1}`}
            description={(visualData as any).description}
            allowTypeSwitch={true}
            allowDataFilter={true}
            showIntelligentSuggestions={true}
          />
        </motion.div>
      );
    }

    if (visualData.type === 'summary' && visualData.summary) {
      return (
        <Card key={index} className="glass-panel bg-glass border border-white/10 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{visualData.summary.title}</h3>
          <div className="space-y-3">
            {visualData.summary.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.value}</span>
                  <Badge variant={
                    item.status === 'good' ? 'default' :
                    item.status === 'warning' ? 'secondary' :
                    'destructive'
                  }>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {visualDataArray.length} visualization{visualDataArray.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportAll}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {visualDataArray.map((visualData, index) => renderChartSection(visualData, index))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
