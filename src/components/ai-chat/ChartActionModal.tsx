import React from 'react';
import { motion } from 'framer-motion';
import { ChartConfiguration } from '@/types/enhancedChat';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  ArrowRight, 
  MessageSquare, 
  BarChart3, 
  PenTool, 
  FileText, 
  TrendingUp,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { useChartActionIntelligence } from '@/hooks/useChartActionIntelligence';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

interface ChartActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartConfig: ChartConfiguration;
  title?: string;
  description?: string;
  chatContext?: string;
}

export const ChartActionModal: React.FC<ChartActionModalProps> = ({
  isOpen,
  onClose,
  chartConfig,
  title,
  description,
  chatContext
}) => {
  const { generateActionSuggestions } = useChartActionIntelligence();

  const actionSuggestions = React.useMemo(() => {
    return generateActionSuggestions({
      chartData: chartConfig.data,
      chartType: chartConfig.type,
      title,
      description,
      chatContext
    });
  }, [chartConfig, title, description, chatContext, generateActionSuggestions]);

  const handleNavigation = (path: string, context?: any) => {
    // In a real app, you'd use React Router here
    window.location.href = path;
    onClose();
  };

  const handleContinueChat = (prompt: string) => {
    // Emit event to continue chat with the suggested prompt
    window.dispatchEvent(new CustomEvent('continueChat', { 
      detail: { prompt } 
    }));
    onClose();
  };

  const renderChartComponent = (config: ChartConfiguration) => {
    const { data, type, colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'] } = config;
    
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available to display
        </div>
      );
    }

    const commonProps = {
      data,
      width: '100%' as const,
      height: 400
    };

    // Extract data keys (same logic as InteractiveChart)
    let dataKeys: string[] = [];
    if (config.series && config.series.length > 0) {
      dataKeys = config.series.map(s => s.dataKey);
    } else if (config.categories?.length) {
      dataKeys = config.categories.filter(cat => cat !== 'name' && cat !== 'label');
    } else {
      dataKeys = Object.keys(data[0] || {}).filter(key => 
        key !== 'name' && key !== 'label' && key !== 'category' && key !== 'type'
      );
    }

    const tooltipStyle = {
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      color: 'hsl(var(--foreground))'
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {dataKeys.map((category, index) => {
                const strokeColor = colors[index % colors.length];
                return (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={strokeColor}
                    strokeWidth={2}
                    dot={{ fill: strokeColor, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: strokeColor, strokeWidth: 2 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {dataKeys.map((category, index) => {
                const fillColor = colors[index % colors.length];
                return (
                  <Bar
                    key={category}
                    dataKey={category}
                    fill={fillColor}
                    radius={[4, 4, 0, 0]}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <defs>
                {colors.map((color, index) => (
                  <linearGradient key={index} id={`colorAreaModal${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {dataKeys.map((category, index) => {
                const strokeColor = colors[index % colors.length];
                return (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={strokeColor}
                    fillOpacity={1}
                    fill={`url(#colorAreaModal${index})`}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => {
                  const fillColor = colors[index % colors.length];
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Unsupported chart type: {type}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col glass-panel">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {title || 'Chart Analysis'}
          </DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Left side - Enhanced Chart Display */}
          <div className="flex flex-col">
            <Card className="flex-1 p-4 glass-panel border border-white/10">
              <div className="h-full min-h-[400px]">
                {renderChartComponent(chartConfig)}
              </div>
              
              {/* Chart Stats */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Data points: {chartConfig.data?.length || 0}
                  </span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {chartConfig.type} chart
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Right side - Actionable Items */}
          <div className="flex flex-col space-y-4 overflow-y-auto">
            {/* AI-Generated Summary */}
            <Card className="p-4 glass-panel border border-white/10">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-warning" />
                Key Insights
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {actionSuggestions.summary}
              </p>
            </Card>

            {/* Quick Actions - Continue in Chat */}
            <Card className="p-4 glass-panel border border-white/10">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Continue Conversation
              </h3>
              <div className="space-y-2">
                {actionSuggestions.chatActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3 bg-background/50 hover:bg-primary/10"
                    onClick={() => handleContinueChat(action.prompt)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <action.icon className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Navigate To Other Pages */}
            <Card className="p-4 glass-panel border border-white/10">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-secondary" />
                Take Action
              </h3>
              <div className="space-y-2">
                {actionSuggestions.navigationActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-left h-auto p-3 bg-background/50 hover:bg-secondary/10"
                    onClick={() => handleNavigation(action.path, action.context)}
                  >
                    <div className="flex items-start gap-2">
                      <action.icon className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </Button>
                ))}
              </div>
            </Card>

            {/* Data Actions */}
            {actionSuggestions.dataActions.length > 0 && (
              <Card className="p-4 glass-panel border border-white/10">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  Data Actions
                </h3>
                <div className="space-y-2">
                  {actionSuggestions.dataActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3 bg-background/50 hover:bg-accent/10"
                      onClick={action.handler}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <action.icon className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-medium text-sm">{action.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};