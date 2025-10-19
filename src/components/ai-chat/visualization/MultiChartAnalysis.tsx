import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { VisualData } from '@/types/enhancedChat';
import { InteractiveChart } from './InteractiveChart';
import { useNavigate } from 'react-router-dom';

interface MultiChartAnalysisProps {
  visualData: VisualData;
  onClose: () => void;
  onDeepDive: (question: string) => void;
  onSendMessage?: (message: string) => void;
}

export const MultiChartAnalysis: React.FC<MultiChartAnalysisProps> = ({
  visualData,
  onClose,
  onDeepDive,
  onSendMessage
}) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  const handleDeepDiveClick = (question: string) => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      onDeepDive(question);
    }, 300);
  };

  const handleQuickAction = (action: any) => {
    if (action.actionType === 'navigate' && action.targetUrl) {
      navigate(action.targetUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isClosing ? 0 : 1, scale: isClosing ? 0.95 : 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <Card 
        className="w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{visualData.title}</h2>
            {visualData.subtitle && (
              <p className="text-muted-foreground">{visualData.subtitle}</p>
            )}
            {visualData.validationStatus && (
              <Badge variant={visualData.validationStatus.isValid ? 'default' : 'destructive'} className="mt-2">
                {visualData.validationStatus.confidence}% Confidence
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Insights */}
          {visualData.summaryInsights && (
            <div className="space-y-4">
              {/* Metric Cards */}
              {visualData.summaryInsights.metricCards && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visualData.summaryInsights.metricCards.map((metric) => (
                    <Card key={metric.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{metric.title}</span>
                        {metric.change && (
                          <Badge variant={metric.change.type === 'increase' ? 'default' : 'secondary'}>
                            {metric.change.type === 'increase' ? '+' : ''}{metric.change.value}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-3xl font-bold">{metric.value}</div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Paragraph Summary */}
              {visualData.summaryInsights.paragraphSummary && (
                <Card className="p-4 bg-primary/5">
                  <p className="text-sm leading-relaxed">{visualData.summaryInsights.paragraphSummary}</p>
                </Card>
              )}

              {/* Bullet Points */}
              {visualData.summaryInsights.bulletPoints && (
                <ul className="space-y-2">
                  {visualData.summaryInsights.bulletPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Alerts */}
              {visualData.summaryInsights.alerts && (
                <div className="space-y-2">
                  {visualData.summaryInsights.alerts.map((alert, i) => (
                    <Card key={i} className={`p-3 border-l-4 ${
                      alert.type === 'error' ? 'border-red-500 bg-red-500/10' :
                      alert.type === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                      'border-green-500 bg-green-500/10'
                    }`}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{alert.message}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Multiple Charts */}
          {visualData.charts && visualData.charts.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Data Visualizations</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {visualData.charts.map((chart, index) => (
                  <Card key={index} className="p-6">
                    <h4 className="text-md font-semibold mb-1">{chart.title}</h4>
                    {chart.subtitle && (
                      <p className="text-sm text-muted-foreground mb-4">{chart.subtitle}</p>
                    )}
                    <InteractiveChart 
                      chartConfig={chart} 
                      onSendMessage={onSendMessage}
                      originalQuery={visualData.title || chart.title || 'show data'}
                    />
                    {chart.chartInsights && chart.chartInsights.length > 0 && (
                      <div className="mt-4 space-y-1">
                        {chart.chartInsights.map((insight, i) => (
                          <p key={i} className="text-xs text-muted-foreground">• {insight}</p>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {visualData.actionableItems && visualData.actionableItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visualData.actionableItems.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleQuickAction(action)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <ExternalLink className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold mb-1">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                        {action.estimatedImpact && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {action.estimatedImpact}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Deep Dive Questions */}
          {visualData.deepDivePrompts && visualData.deepDivePrompts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Deep Dive Questions</h3>
              <div className="flex flex-wrap gap-2">
                {visualData.deepDivePrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeepDiveClick(prompt)}
                    className="text-sm"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
