import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InteractiveChart } from './InteractiveChart';
import { ChartConfiguration } from '@/types/enhancedChat';
import { 
  BarChart3, 
  Table as TableIcon, 
  TrendingUp, 
  FileSpreadsheet,
  Lightbulb,
  Eye
} from 'lucide-react';

interface SmartDataViewerProps {
  chartConfig: ChartConfiguration;
  title?: string;
  description?: string;
}

export const SmartDataViewer: React.FC<SmartDataViewerProps> = ({
  chartConfig,
  title,
  description
}) => {
  // Analyze data to provide smart recommendations
  const dataAnalysis = useMemo(() => {
    const data = chartConfig.data || [];
    const dataLength = data.length;
    const firstItem = data[0];
    
    if (!firstItem) {
      return { 
        recommendation: 'chart', 
        reason: 'No data available',
        confidence: 'low',
        insights: []
      };
    }

    const numericColumns = Object.keys(firstItem).filter(key => 
      typeof firstItem[key] === 'number' && !['id', 'index'].includes(key)
    );
    
    const textColumns = Object.keys(firstItem).filter(key => 
      typeof firstItem[key] === 'string'
    );

    const insights = [];
    let recommendation: 'chart' | 'table' | 'both' = 'chart';
    let reason = '';
    let confidence: 'high' | 'medium' | 'low' = 'medium';

    // Analysis logic
    if (dataLength > 50) {
      insights.push('Large dataset - table view excellent for detailed analysis');
      recommendation = 'both';
      reason = 'Large dataset benefits from both visualization and detailed table view';
      confidence = 'high';
    } else if (numericColumns.length >= 3) {
      insights.push('Multiple metrics - great for trend visualization');
      recommendation = 'chart';
      reason = 'Multiple numeric columns create meaningful chart comparisons';
      confidence = 'high';
    } else if (textColumns.length > numericColumns.length) {
      insights.push('Rich textual data - table view shows full context');
      recommendation = 'table';
      reason = 'More text than numbers - table format preserves information better';
      confidence = 'medium';
    } else if (dataLength < 10) {
      insights.push('Small dataset - both views work well');
      recommendation = 'both';
      reason = 'Small dataset easy to digest in either format';
      confidence = 'medium';
    }

    // Add specific insights based on data patterns
    if (numericColumns.some(col => col.toLowerCase().includes('percent') || col.toLowerCase().includes('rate'))) {
      insights.push('Contains percentages/rates - excellent for bar or pie charts');
    }
    
    if (Object.keys(firstItem).some(key => key.toLowerCase().includes('month') || key.toLowerCase().includes('date'))) {
      insights.push('Time-series data - line charts show trends effectively');
    }

    if (numericColumns.some(col => col.toLowerCase().includes('revenue') || col.toLowerCase().includes('price'))) {
      insights.push('Financial data - table view recommended for precise values and export');
    }

    return { recommendation, reason, confidence, insights, numericColumns: numericColumns.length };
  }, [chartConfig]);

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'chart': return <BarChart3 className="w-4 h-4" />;
      case 'table': return <TableIcon className="w-4 h-4" />;
      case 'both': return <Eye className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'chart': return 'blue';
      case 'table': return 'green'; 
      case 'both': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Smart Recommendation Panel */}
      <Alert className="glass-panel bg-glass border border-white/10">
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Smart Recommendation:</span>
                <Badge 
                  variant="outline" 
                  className={`bg-${getRecommendationColor(dataAnalysis.recommendation)}-500/10 text-${getRecommendationColor(dataAnalysis.recommendation)}-500 border-${getRecommendationColor(dataAnalysis.recommendation)}-500/20`}
                >
                  {getRecommendationIcon(dataAnalysis.recommendation)}
                  <span className="ml-1 capitalize">
                    {dataAnalysis.recommendation === 'both' ? 'Chart + Table' : dataAnalysis.recommendation}
                  </span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{dataAnalysis.reason}</p>
              {dataAnalysis.insights.length > 0 && (
                <div className="space-y-1">
                  {dataAnalysis.insights.map((insight, index) => (
                    <p key={index} className="text-xs text-muted-foreground/80 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-primary/60" />
                      {insight}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right space-y-1">
              <Badge variant="outline" className="text-xs">
                {chartConfig.data?.length || 0} rows
              </Badge>
              <br />
              <Badge variant="outline" className="text-xs">
                {dataAnalysis.numericColumns} metrics
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Enhanced Interactive Chart */}
      <InteractiveChart
        chartConfig={chartConfig}
        title={title}
        description={description}
        allowTypeSwitch={true}
        allowDataFilter={true}
        onDataUpdate={(data) => {
          console.log('Data updated:', data.length, 'rows');
        }}
        onExport={() => {
          console.log('Exporting chart data');
        }}
      />
    </motion.div>
  );
};