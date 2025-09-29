import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Lightbulb,
  Loader2,
  Sparkles
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
  conversationHistory?: any[];
  onContinueChat?: (prompt: string) => void;
}

export const ChartActionModal: React.FC<ChartActionModalProps> = ({
  isOpen,
  onClose,
  chartConfig,
  title,
  description,
  chatContext,
  conversationHistory = [],
  onContinueChat
}) => {
  const navigate = useNavigate();
  const { generateActionSuggestions, isAnalyzing } = useChartActionIntelligence();
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const actionSuggestions = React.useMemo(() => {
    return generateActionSuggestions({
      chartData: chartConfig.data,
      chartType: chartConfig.type,
      title,
      description,
      chatContext,
      conversationHistory
    });
  }, [chartConfig, title, description, chatContext, conversationHistory, generateActionSuggestions]);

  const handleNavigation = async (path: string, context?: any) => {
    setIsNavigating(true);
    setLoadingAction(path);
    
    try {
      // Add smooth delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate with proper context
      if (path === '/content-builder' && context) {
        navigate(path, { 
          state: { 
            chartInsights: context,
            preFilledKeyword: title,
            sourceData: chartConfig.data
          } 
        });
      } else if (path === '/analytics' && context) {
        navigate(path, { 
          state: { 
            focusMetric: context.focusMetric,
            chartData: chartConfig.data
          } 
        });
      } else {
        navigate(path);
      }
      
      onClose();
    } finally {
      setIsNavigating(false);
      setLoadingAction(null);
    }
  };

  const handleContinueChat = (prompt: string) => {
    if (onContinueChat) {
      onContinueChat(prompt);
    } else {
      // Fallback: emit event for backwards compatibility
      window.dispatchEvent(new CustomEvent('continueChat', { 
        detail: { prompt } 
      }));
    }
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
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col glass-panel bg-background/95 backdrop-blur-xl border border-white/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                  <div className="relative">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    {isAnalyzing && (
                      <Sparkles className="w-3 h-3 text-warning absolute -top-1 -right-1 animate-pulse" />
                    )}
                  </div>
                  {title || 'Chart Analysis'}
                  <Badge variant="secondary" className="ml-auto text-xs bg-primary/10 text-primary">
                    AI Powered
                  </Badge>
                </DialogTitle>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </DialogHeader>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
                {/* Left side - Enhanced Chart Display */}
                <motion.div 
                  className="flex flex-col"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="flex-1 p-4 glass-panel border border-white/10 bg-background/50 backdrop-blur">
                    <div className="h-full min-h-[400px] relative">
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Analyzing chart data...</span>
                          </div>
                        </div>
                      )}
                      {renderChartComponent(chartConfig)}
                    </div>
                    
                    {/* Enhanced Chart Stats */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span className="text-muted-foreground">
                            {chartConfig.data?.length || 0} data points
                          </span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {chartConfig.type} chart
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Right side - Actionable Items */}
                <motion.div 
                  className="flex flex-col space-y-4 overflow-y-auto"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* AI-Generated Summary */}
                  <Card className="p-4 glass-panel border border-white/10 bg-background/50 backdrop-blur">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <div className="relative">
                        <Lightbulb className="w-4 h-4 text-warning" />
                        <div className="absolute inset-0 bg-warning/20 rounded-full blur-sm"></div>
                      </div>
                      Key Insights
                    </h3>
                    <motion.p 
                      className="text-sm text-muted-foreground leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {actionSuggestions.summary}
                    </motion.p>
                  </Card>

                  {/* Quick Actions - Continue in Chat */}
                  <Card className="p-4 glass-panel border border-white/10 bg-background/50 backdrop-blur">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Continue Conversation
                    </h3>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {actionSuggestions.chatActions.map((action, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-left h-auto p-3 bg-background/50 hover:bg-primary/10 hover:scale-[1.02] transition-all duration-200"
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
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </Card>

                  {/* Navigate To Other Pages */}
                  <Card className="p-4 glass-panel border border-white/10 bg-background/50 backdrop-blur">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-secondary" />
                      Take Action
                      {isNavigating && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
                    </h3>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {actionSuggestions.navigationActions.map((action, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isNavigating}
                              className="w-full justify-between text-left h-auto p-3 bg-background/50 hover:bg-secondary/10 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
                              onClick={() => handleNavigation(action.path, action.context)}
                            >
                              <div className="flex items-start gap-2">
                                {loadingAction === action.path ? (
                                  <Loader2 className="w-4 h-4 mt-0.5 animate-spin flex-shrink-0" />
                                ) : (
                                  <action.icon className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                                )}
                                <div className="text-left">
                                  <div className="font-medium text-sm">{action.title}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {action.description}
                                  </div>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </Card>

                  {/* Data Actions */}
                  {actionSuggestions.dataActions.length > 0 && (
                    <Card className="p-4 glass-panel border border-white/10 bg-background/50 backdrop-blur">
                      <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent" />
                        Data Actions
                      </h3>
                      <div className="space-y-2">
                        <AnimatePresence>
                          {actionSuggestions.dataActions.map((action, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left h-auto p-3 bg-background/50 hover:bg-accent/10 hover:scale-[1.02] transition-all duration-200"
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
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </Card>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};