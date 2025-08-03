
import React from 'react';
import { motion } from 'framer-motion';
import { VisualData } from '@/types/enhancedChat';
import { LineChart, BarChart, PieChartComponent } from '@/components/ui/chart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

interface VisualDataRendererProps {
  visualData: VisualData;
}

export const VisualDataRenderer: React.FC<VisualDataRendererProps> = ({ visualData }) => {
  const renderChart = () => {
    if (!visualData.chartConfig) return null;

    const { type, data, categories, colors, valueFormatter, height = 300 } = visualData.chartConfig;

    const chartProps = {
      data,
      categories,
      colors,
      valueFormatter,
      className: `h-[${height}px]`
    };

    switch (type) {
      case 'line':
        return <LineChart {...chartProps} />;
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'pie':
        return <PieChartComponent {...chartProps} />;
      case 'area':
        return <LineChart {...chartProps} />;
      default:
        return <div className="text-muted-foreground">Chart type not supported</div>;
    }
  };

  const renderMetrics = () => {
    if (!visualData.metrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visualData.metrics.map((metric) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <Card className="p-4 border border-white/10 bg-white/5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  {metric.change && (
                    <div className="flex items-center gap-1 text-xs">
                      {metric.change.type === 'increase' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={metric.change.type === 'increase' ? 'text-green-500' : 'text-red-500'}>
                        {metric.change.value}% {metric.change.period}
                      </span>
                    </div>
                  )}
                </div>
                {metric.icon && (
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderWorkflow = () => {
    if (!visualData.workflowStep) return null;

    const { title, description, actions, progress } = visualData.workflowStep;

    return (
      <Card className="p-6 border border-white/10 bg-white/5 backdrop-blur-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {progress && (
              <Badge variant="secondary">
                {progress.current} / {progress.total}
              </Badge>
            )}
          </div>
          
          {progress && (
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderSummary = () => {
    if (!visualData.summary) return null;

    const { title, items } = visualData.summary;

    return (
      <Card className="p-6 border border-white/10 bg-white/5 backdrop-blur-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.value}</span>
                <Badge 
                  variant={item.status === 'good' ? 'default' : item.status === 'warning' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {item.status === 'good' ? 'Good' : item.status === 'warning' ? 'OK' : 'Needs Attention'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4"
    >
      {visualData.type === 'chart' && renderChart()}
      {visualData.type === 'metrics' && renderMetrics()}
      {visualData.type === 'workflow' && renderWorkflow()}
      {visualData.type === 'summary' && renderSummary()}
    </motion.div>
  );
};
