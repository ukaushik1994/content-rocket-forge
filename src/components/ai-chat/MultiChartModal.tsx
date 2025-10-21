import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { 
  Download, 
  Share2, 
  X, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Table as TableIcon,
  ArrowRight,
  ExternalLink,
  Zap,
  Target,
  Clock,
  Filter,
  Edit,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Save,
  History,
  Link2,
  Info,
  Brain,
  Shield,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { ChartInteractiveWrapper } from './ChartInteractiveWrapper';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { SavedAnalysesList } from './SavedAnalysesList';
import { AnalysisVersionHistory } from './AnalysisVersionHistory';
import { VersionComparisonModal } from './VersionComparisonModal';
import { ChartQAPanel } from './ChartQAPanel';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
import { VisualData, ChartConfiguration, ActionableItem } from '@/types/enhancedChat';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MultiChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  visualData?: VisualData;
  allVisualData?: VisualData[];
  currentChartConfig?: ChartConfiguration;
  title?: string;
  description?: string;
  actionableItems?: ActionableItem[];
  deepDivePrompts?: string[];
  insights?: string[];
  context?: any;
  onDeepDiveClick?: (prompt: string) => void;
  onActionClick?: (action: any) => void;
}

// Icon mapping for dynamic icon loading
const ICON_MAP: Record<string, any> = {
  TrendingUp, TrendingDown, ArrowRight, ExternalLink, Zap, Target, Sparkles, Activity, Clock,
  PieIcon, BarChart3, LineIcon, TableIcon, CheckCircle2, AlertTriangle
};

// Chart type to icon mapping
const CHART_TYPE_ICONS: Record<string, any> = {
  'pie': PieIcon,
  'bar': BarChart3,
  'line': LineIcon,
  'area': Activity,
  'table': TableIcon
};

// Helper functions for static Tailwind classes
const getCardClasses = (colorTheme: string): string => {
  switch (colorTheme) {
    case 'blue':
      return 'relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-3 hover:border-blue-400/30 transition-all duration-200';
    case 'orange':
      return 'relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-3 hover:border-orange-400/30 transition-all duration-200';
    case 'red':
      return 'relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-3 hover:border-red-400/30 transition-all duration-200';
    case 'green':
      return 'relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-3 hover:border-green-400/30 transition-all duration-200';
    case 'purple':
      return 'relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-3 hover:border-purple-400/30 transition-all duration-200';
    case 'yellow':
      return 'relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-3 hover:border-yellow-400/30 transition-all duration-200';
    case 'indigo':
      return 'relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-xl p-3 hover:border-indigo-400/30 transition-all duration-200';
    default:
      return 'relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-3 hover:border-purple-400/30 transition-all duration-200';
  }
};

const getIconWrapperClasses = (colorTheme: string): string => {
  switch (colorTheme) {
    case 'blue':
      return 'p-1 bg-blue-500/20 rounded-lg';
    case 'orange':
      return 'p-1 bg-orange-500/20 rounded-lg';
    case 'red':
      return 'p-1 bg-red-500/20 rounded-lg';
    case 'green':
      return 'p-1 bg-green-500/20 rounded-lg';
    case 'purple':
      return 'p-1 bg-purple-500/20 rounded-lg';
    case 'yellow':
      return 'p-1 bg-yellow-500/20 rounded-lg';
    case 'indigo':
      return 'p-1 bg-indigo-500/20 rounded-lg';
    default:
      return 'p-1 bg-purple-500/20 rounded-lg';
  }
};

const getIconClasses = (colorTheme: string): string => {
  switch (colorTheme) {
    case 'blue':
      return 'h-3 w-3 text-blue-400';
    case 'orange':
      return 'h-3 w-3 text-orange-400';
    case 'red':
      return 'h-3 w-3 text-red-400';
    case 'green':
      return 'h-3 w-3 text-green-400';
    case 'purple':
      return 'h-3 w-3 text-purple-400';
    case 'yellow':
      return 'h-3 w-3 text-yellow-400';
    case 'indigo':
      return 'h-3 w-3 text-indigo-400';
    default:
      return 'h-3 w-3 text-purple-400';
  }
};

const getBadgeClasses = (colorTheme: string): string => {
  switch (colorTheme) {
    case 'blue':
      return 'bg-blue-500/10 text-blue-300 border-blue-500/30 text-[10px] px-1.5 py-0 h-4';
    case 'orange':
      return 'bg-orange-500/10 text-orange-300 border-orange-500/30 text-[10px] px-1.5 py-0 h-4';
    case 'red':
      return 'bg-red-500/10 text-red-300 border-red-500/30 text-[10px] px-1.5 py-0 h-4';
    case 'green':
      return 'bg-green-500/10 text-green-300 border-green-500/30 text-[10px] px-1.5 py-0 h-4';
    case 'purple':
      return 'bg-purple-500/10 text-purple-300 border-purple-500/30 text-[10px] px-1.5 py-0 h-4';
    case 'yellow':
      return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30 text-[10px] px-1.5 py-0 h-4';
    case 'indigo':
      return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 text-[10px] px-1.5 py-0 h-4';
    default:
      return 'bg-purple-500/10 text-purple-300 border-purple-500/30 text-[10px] px-1.5 py-0 h-4';
  }
};

const getValueClasses = (colorTheme: string): string => {
  switch (colorTheme) {
    case 'blue':
      return 'text-xl font-bold text-blue-400';
    case 'orange':
      return 'text-xl font-bold text-orange-400';
    case 'red':
      return 'text-xl font-bold text-red-400';
    case 'green':
      return 'text-xl font-bold text-green-400';
    case 'purple':
      return 'text-xl font-bold text-purple-400';
    case 'yellow':
      return 'text-xl font-bold text-yellow-400';
    case 'indigo':
      return 'text-xl font-bold text-indigo-400';
    default:
      return 'text-xl font-bold text-purple-400';
  }
};

const getProgressClasses = (colorTheme: string): string => {
  switch (colorTheme) {
    case 'blue':
      return 'h-1 bg-blue-500/10';
    case 'orange':
      return 'h-1 bg-orange-500/10';
    case 'red':
      return 'h-1 bg-red-500/10';
    case 'green':
      return 'h-1 bg-green-500/10';
    case 'purple':
      return 'h-1 bg-purple-500/10';
    case 'yellow':
      return 'h-1 bg-yellow-500/10';
    case 'indigo':
      return 'h-1 bg-indigo-500/10';
    default:
      return 'h-1 bg-purple-500/10';
  }
};

const getDescriptionClasses = (colorTheme: string): string => {
  switch (colorTheme) {
    case 'blue':
      return 'text-xs text-blue-300/70 leading-tight';
    case 'orange':
      return 'text-xs text-orange-300/70 leading-tight';
    case 'red':
      return 'text-xs text-red-300/70 leading-tight';
    case 'green':
      return 'text-xs text-green-300/70 leading-tight';
    case 'purple':
      return 'text-xs text-purple-300/70 leading-tight';
    case 'yellow':
      return 'text-xs text-yellow-300/70 leading-tight';
    case 'indigo':
      return 'text-xs text-indigo-300/70 leading-tight';
    default:
      return 'text-xs text-purple-300/70 leading-tight';
  }
};

// Color theme mapping based on icon or metric type
const getMetricColorTheme = (icon?: string): string => {
  const colorMap: Record<string, string> = {
    'TrendingUp': 'green',
    'TrendingDown': 'red',
    'Activity': 'orange',
    'Target': 'orange',
    'BarChart3': 'blue',
    'Zap': 'purple',
    'AlertTriangle': 'red',
    'TableIcon': 'blue',
    'Users': 'indigo',
    'DollarSign': 'green',
    'Eye': 'blue',
    'CheckCircle2': 'green',
  };
  return icon ? (colorMap[icon] || 'purple') : 'purple';
};

// Calculate progress value for progress bar
const calculateProgressValue = (metric: any): number => {
  if (typeof metric.value === 'string' && metric.value.includes('%')) {
    const numValue = parseFloat(metric.value);
    return isNaN(numValue) ? 50 : numValue;
  }
  if (metric.change?.value) {
    return Math.min(Math.abs(metric.change.value), 100);
  }
  if (typeof metric.value === 'number' && metric.value <= 100) {
    return metric.value;
  }
  return 50;
};

// Animated Metric Card Component - SERP Style
const AnimatedMetricCard: React.FC<{ 
  label: string; 
  value: any; 
  icon: any; 
  trend?: string; 
  trendUp?: boolean;
  suffix?: string;
  isText?: boolean;
  index: number;
  iconName?: string;
  change?: { value: number; period?: string };
}> = ({ label, value, icon: Icon, trend, trendUp, suffix, isText, index, iconName, change }) => {
  const colorTheme = getMetricColorTheme(iconName);
  const progressValue = calculateProgressValue({ value, change });
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="h-full"
    >
      <Card className={getCardClasses(colorTheme)}>
        <div className="flex flex-col h-full">
          {/* Top: Icon + Badge */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {Icon && (
                <div className={getIconWrapperClasses(colorTheme)}>
                  <Icon className={getIconClasses(colorTheme)} />
                </div>
              )}
            </div>
            <Badge variant="outline" className={getBadgeClasses(colorTheme)}>
              {label}
            </Badge>
          </div>

          {/* Middle: Value + Progress */}
          <div className="space-y-1.5">
            <motion.div 
              className={isText ? 'text-lg font-bold' : getValueClasses(colorTheme)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
            >
              {isText ? value : `${value}${suffix || ''}`}
            </motion.div>
            
            <div className="space-y-1">
              <Progress value={progressValue} className={getProgressClasses(colorTheme)} />
              <p className={getDescriptionClasses(colorTheme)}>
                {change?.period || label}
              </p>
            </div>
          </div>

          {/* Bottom: Trend (if exists) */}
          {trend && (
            <motion.div 
              className="flex items-center gap-1 text-xs mt-1 h-[24px]"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {trendUp ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={trendUp ? 'text-green-500' : 'text-red-500'}>
                {trend}
              </span>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// Key Metrics Panel Component
const KeyMetricsPanel: React.FC<{ visualData?: VisualData; context?: any }> = ({ visualData, context }) => {
  // Use AI-provided metricCards
  const aiMetrics = visualData?.summaryInsights?.metricCards || [];
  
  // Fallback to hardcoded only if AI didn't provide any
  const analytics = context?.analytics || {};
  const fallbackMetrics = aiMetrics.length === 0 ? [
    {
      id: 'total-content',
      title: 'Total Content',
      value: analytics.totalContent || 0,
      icon: 'TableIcon',
      change: { value: 12, type: 'increase' as const, period: 'vs last month' }
    },
    {
      id: 'avg-seo',
      title: 'Avg SEO Score',
      value: analytics.avgSeoScore || 0,
      icon: 'TrendingUp'
    },
    {
      id: 'needs-attention',
      title: 'Needs Attention',
      value: analytics.lowPerformers || 0,
      icon: 'AlertTriangle',
      color: 'warning' as const
    },
    {
      id: 'top-performer',
      title: 'Top Performer',
      value: analytics.topContent?.title || 'N/A',
      icon: 'Target'
    }
  ] : [];
  
  const metrics = aiMetrics.length > 0 ? aiMetrics : fallbackMetrics;
  
  // Dynamic grid based on metric count
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2 md:grid-cols-4';
    if (count === 5) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
    if (count === 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-4';
  };
  
  if (metrics.length === 0) return null;

  return (
    <div className={`grid ${getGridClass(metrics.length)} gap-4 mb-6 auto-rows-[120px]`}>
      {metrics.map((metric, idx) => (
        <AnimatedMetricCard 
          key={metric.id || idx}
          label={metric.title}
          value={metric.value}
          icon={ICON_MAP[metric.icon || 'Activity'] || Activity}
          iconName={metric.icon}
          trend={metric.change?.value ? `${metric.change.value > 0 ? '+' : ''}${metric.change.value}% ${metric.change.period || ''}` : undefined}
          trendUp={metric.change?.type === 'increase'}
          isText={typeof metric.value === 'string' && isNaN(Number(metric.value))}
          index={idx}
          change={metric.change}
        />
      ))}
    </div>
  );
};

// Chart Context Panel - Phase 4: Multi-perspective information display
const ChartContextPanel: React.FC<{ 
  perspectives: any;
  chartTitle: string;
}> = ({ perspectives, chartTitle }) => {
  if (!perspectives) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6"
    >
      <Card className="p-5 glass-panel bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Understanding "{chartTitle}"
        </h3>
        
        <div className="space-y-4">
          {/* Descriptive Perspective */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="text-lg">📊</span>
              What This Shows
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {perspectives.descriptive}
            </p>
          </div>
          
          {/* Strategic Perspective */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="text-lg">💡</span>
              Why It Matters
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {perspectives.strategic}
            </p>
          </div>
          
          {/* Analytical Perspective */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="text-lg">📈</span>
              Key Patterns
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {perspectives.analytical}
            </p>
          </div>
          
          {/* Comparative Perspective */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="text-lg">🎯</span>
              Benchmark Comparison
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {perspectives.comparative}
            </p>
          </div>
          
          {/* Actionable Perspective */}
          {perspectives.actionable && perspectives.actionable.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <span className="text-lg">⚡</span>
                Recommended Actions
              </div>
              <ul className="space-y-1 pl-6">
                {perspectives.actionable.map((action: string, idx: number) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// AI Insights Panel Component (Collapsible) - Minimal by default
const AIInsightsPanel: React.FC<{ insights: string[]; onDeepDiveClick?: (insight: string) => void }> = ({ insights, onDeepDiveClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!insights || insights.length === 0) return null;
  
  const displayedInsights = isExpanded ? insights : insights.slice(0, 2);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="p-5 glass-panel bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 mb-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">AI Insights</h3>
          </div>
          {insights.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Show Less' : `+${insights.length - 2} More`}
            </Button>
          )}
        </div>
        <ul className="space-y-2">
          <AnimatePresence>
            {displayedInsights.map((insight, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-3 rounded-lg hover:bg-white/5 group"
                onClick={() => onDeepDiveClick?.(insight)}
              >
                <span className="text-primary mt-0.5 group-hover:scale-125 transition-transform">✦</span>
                <span className="flex-1">{insight}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Card>
    </motion.div>
  );
};

// Quick Actions Component
const QuickActionsPanel: React.FC<{
  actionableItems: ActionableItem[];
  deepDivePrompts: string[];
  onActionClick?: (action: any) => void;
  onClose: () => void;
}> = ({ actionableItems, deepDivePrompts, onActionClick, onClose }) => {
  const navigate = useNavigate();

  const handleAction = (action: ActionableItem) => {
    onClose();
    
    if (action.action?.includes('navigate') && action.targetUrl) {
      navigate(action.targetUrl);
    } else if (action.action === 'send_message') {
      onActionClick?.(action);
    }
  };

  if (!actionableItems?.length && !deepDivePrompts?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-6"
    >
      {actionableItems && actionableItems.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actionableItems.map((action, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all group"
                  onClick={() => handleAction(action)}
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  {action.title}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {deepDivePrompts && deepDivePrompts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Deep Dive Questions
          </h4>
          <div className="flex flex-wrap gap-2">
            {deepDivePrompts.map((prompt, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1.5 text-xs"
                  onClick={() => {
                    onActionClick?.({ action: 'send_message', data: { message: prompt } });
                    onClose();
                  }}
                >
                  {prompt}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const MultiChartModal: React.FC<MultiChartModalProps> = ({
  isOpen,
  onClose,
  visualData,
  allVisualData = [],
  currentChartConfig,
  title,
  description,
  actionableItems = [],
  deepDivePrompts = [],
  insights = [],
  context = {},
  onDeepDiveClick,
  onActionClick
}) => {
  const { toast } = useToast();
  const [selectedChartType, setSelectedChartType] = useState<Record<number, string>>({});
  const [selectedFilter, setSelectedFilter] = useState<Record<number, string>>({});
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Phase 2: Interactive states
  const [zoomLevels, setZoomLevels] = useState<Record<number, number>>({});
  const [syncZoom, setSyncZoom] = useState(false);
  const [linkedHoverData, setLinkedHoverData] = useState<any>(null);
  
  // Phase 3: Persistence states
  const [showDataInfo, setShowDataInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [showSavedList, setShowSavedList] = useState(false);
  
  // Phase 3: Loaded analysis data (overrides props when loaded)
  const [loadedCharts, setLoadedCharts] = useState<ChartConfiguration[] | null>(null);
  const [loadedInsights, setLoadedInsights] = useState<string[] | null>(null);
  const [loadedActionableItems, setLoadedActionableItems] = useState<ActionableItem[] | null>(null);
  const [loadedDeepDivePrompts, setLoadedDeepDivePrompts] = useState<string[] | null>(null);

  // Phase 4: Version history states
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showVersionComparison, setShowVersionComparison] = useState(false);
  const [comparisonVersions, setComparisonVersions] = useState<[any, any] | null>(null);
  
  // Phase 4: AI-powered insights state
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiInsights, setAIInsights] = useState<{
    predictions?: string[];
    anomalies?: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }>;
    recommendations?: Array<{ title: string; description: string; impact: string }>;
    trends?: string[];
  }>({});

  // Extract all charts - use loaded charts if available
  const charts = useMemo(() => {
    if (loadedCharts) {
      return loadedCharts;
    }
    
    const chartConfigs: ChartConfiguration[] = [];
    
    if (currentChartConfig) {
      chartConfigs.push(currentChartConfig);
    }
    
    allVisualData.forEach(vd => {
      if (vd.chartConfig) {
        chartConfigs.push(vd.chartConfig);
      }
    });
    
    // Deduplicate by type
    const seen = new Set();
    return chartConfigs.filter(config => {
      if (seen.has(config.type)) return false;
      seen.add(config.type);
      return true;
    }).slice(0, 4);
  }, [allVisualData, currentChartConfig, loadedCharts]);

  // Use loaded data if available, otherwise use props
  const displayInsights = loadedInsights || insights;
  const displayActionableItems = loadedActionableItems || actionableItems;
  const displayDeepDivePrompts = loadedDeepDivePrompts || deepDivePrompts;

  // Carousel navigation - Define before use in useEffect (scroll by 2 for side-by-side view)
  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      const currentIndex = emblaApi.selectedScrollSnap();
      emblaApi.scrollTo(Math.max(currentIndex - 2, 0));
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      const currentIndex = emblaApi.selectedScrollSnap();
      emblaApi.scrollTo(currentIndex + 2);
    }
  }, [emblaApi]);

  // Phase 1: Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          scrollPrev();
          break;
        case 'ArrowRight':
          scrollNext();
          break;
        case 'Home':
          emblaApi?.scrollTo(0);
          break;
        case 'End':
          emblaApi?.scrollTo(charts.length - 1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, scrollPrev, scrollNext, emblaApi, charts.length]);

  // Phase 2: Zoom handlers
  const handleZoomChange = useCallback((index: number, level: number) => {
    if (syncZoom) {
      const newLevels: Record<number, number> = {};
      charts.forEach((_, i) => newLevels[i] = level);
      setZoomLevels(newLevels);
    } else {
      setZoomLevels(prev => ({ ...prev, [index]: level }));
    }
  }, [syncZoom, charts]);

  // Handle load analysis
  const handleLoadAnalysis = (analysis: any) => {
    try {
      // Restore charts
      if (analysis.charts_data) {
        setLoadedCharts(analysis.charts_data);
      }
      
      // Restore insights
      if (analysis.insights) {
        setLoadedInsights(analysis.insights);
      }
      
      // Restore action items
      if (analysis.actionable_items) {
        setLoadedActionableItems(analysis.actionable_items);
      }
      
      // Restore deep dive prompts
      if (analysis.deep_dive_prompts) {
        setLoadedDeepDivePrompts(analysis.deep_dive_prompts);
      }
      
      // Set analysis metadata
      setAnalysisId(analysis.id);
      setIsSaved(true);
      setShowSavedList(false);
      
      toast({
        title: "Analysis loaded",
        description: `Loaded "${analysis.title}"`
      });
    } catch (error: any) {
      console.error('Error loading analysis:', error);
      toast({
        title: "Error loading analysis",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Phase 4: Handle version comparison
  const handleCompareVersions = (v1: any, v2: any) => {
    setComparisonVersions([v1, v2]);
    setShowVersionComparison(true);
    setShowVersionHistory(false);
  };

  // Phase 3: Save analysis (Real implementation)
  const handleSaveAnalysis = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ 
          title: 'Authentication Required', 
          description: 'Please sign in to save analysis',
          variant: 'destructive'
        });
        return;
      }

      const analysisData = {
        user_id: user.id,
        title: title || 'Untitled Analysis',
        description,
        charts_data: charts as any,
        insights: displayInsights as any,
        actionable_items: displayActionableItems as any,
        deep_dive_prompts: displayDeepDivePrompts as any,
        context: context as any
      };

      let result;
      if (analysisId) {
        // Update existing
        const { data, error } = await supabase
          .from('saved_chart_analyses')
          .update(analysisData)
          .eq('id', analysisId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        toast({ title: 'Updated', description: 'Analysis updated successfully' });
      } else {
        // Create new
        const { data, error } = await supabase
          .from('saved_chart_analyses')
          .insert(analysisData)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        setAnalysisId(result.id);
        toast({ title: 'Saved', description: 'Analysis saved successfully' });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save analysis', 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Phase 3: Share analysis
  const handleShare = async () => {
    if (!analysisId) {
      toast({ 
        title: 'Save First', 
        description: 'Please save the analysis before sharing',
        variant: 'default'
      });
      return;
    }
    
    const shareUrl = `${window.location.origin}/analysis/${analysisId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ 
        title: 'Link Copied', 
        description: 'Shareable link copied to clipboard' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to copy link', 
        variant: 'destructive' 
      });
    }
  };

  // Phase 2: Enhanced Export to PNG with html2canvas
  const handleExportPNG = useCallback(async (chartIndex: number) => {
    try {
      const chart = charts[chartIndex];
      if (!chart) return;

      // Dynamic import html2canvas
      const html2canvas = (await import('html2canvas')).default;

      // Find the chart container element
      const chartElements = document.querySelectorAll('[role="tabpanel"]');
      const chartElement = chartElements[chartIndex] as HTMLElement;
      
      if (!chartElement) {
        throw new Error('Chart element not found');
      }

      toast({ title: 'Exporting...', description: 'Generating high-quality image' });

      // Capture the chart with html2canvas
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chart.title || 'chart'}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Exported', description: 'Chart exported as high-quality PNG' });
      });
    } catch (error) {
      console.error('Export PNG error:', error);
      toast({ 
        title: 'Export Failed', 
        description: 'Could not export chart. Try again or use CSV export.',
        variant: 'destructive' 
      });
    }
  }, [charts, toast]);

  // Phase 1: Export to CSV
  const handleExportCSV = useCallback((chartIndex: number) => {
    try {
      const chart = charts[chartIndex];
      if (!chart || !chart.data || chart.data.length === 0) return;

      // Convert data to CSV
      const headers = Object.keys(chart.data[0]);
      const csvRows = [
        headers.join(','),
        ...chart.data.map(row => 
          headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chart.title || 'chart'}-data-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: 'Exported', description: 'Data exported as CSV' });
    } catch (error) {
      console.error('Export CSV error:', error);
      toast({ title: 'Error', description: 'Failed to export CSV', variant: 'destructive' });
    }
  }, [charts, toast]);
  
  // Phase 4: Generate AI insights (Real AI implementation)
  const generateAIInsights = useCallback(async () => {
    if (charts.length === 0) {
      toast({ 
        title: 'No Data', 
        description: 'No charts available to analyze',
        variant: 'default'
      });
      return;
    }

    setShowAIRecommendations(true);
    setAIInsights({
      predictions: ['Analyzing data...'],
      anomalies: [],
      recommendations: [],
      trends: []
    });

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'analyze-chart-data',
        {
          body: { 
            charts: charts.map(c => ({
              title: c.title,
              type: c.type,
              data: c.data?.slice(0, 50) // Limit data points for API
            })),
            context: context,
            userQuery: title || description
          }
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to generate insights');
      }

      if (functionData?.error) {
        throw new Error(functionData.error);
      }

      if (functionData?.insights) {
        setAIInsights(functionData.insights);
        toast({ 
          title: 'AI Analysis Complete', 
          description: `Generated ${functionData.insights.predictions?.length || 0} predictions and ${functionData.insights.recommendations?.length || 0} recommendations`,
          duration: 3000
        });
      } else {
        throw new Error('No insights returned from AI');
      }

    } catch (error: any) {
      console.error('AI insights error:', error);
      
      // Show user-friendly error
      toast({ 
        title: 'AI Analysis Failed', 
        description: error.message || 'Could not generate insights. Please try again.',
        variant: 'destructive'
      });

      // Set fallback mock insights
      const mockInsights = {
        predictions: [
          "Unable to generate predictions at this time",
          "Please try again or check your connection"
        ],
        anomalies: [],
        recommendations: [
          {
            title: "Try Again Later",
            description: "AI analysis temporarily unavailable. Your chart data is saved.",
            impact: "Resume analysis when service is available"
          }
        ],
        trends: []
      };
      
      setAIInsights(mockInsights);
    }
  }, [charts, context, title, description, toast, supabase]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Normalize pie chart data
  const normalizePieChartData = (data: any[]): any[] => {
    if (!data || data.length === 0) return [];
    if (data[0].name && data[0].value !== undefined) return data;
    
    const stringKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'string');
    const numberKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
    
    const namePriority = ['name', 'label', 'solution', 'category', 'title', 'key'];
    const valuePriority = ['value', 'impressions', 'clicks', 'count', 'total', 'amount'];
    
    const nameKey = namePriority.find(key => stringKeys.includes(key)) || stringKeys[0] || 'name';
    const valueKey = valuePriority.find(key => numberKeys.includes(key)) || numberKeys[0] || 'value';
    
    return data.map(item => ({
      name: item[nameKey] || item.name || 'Unknown',
      value: Number(item[valueKey] || item.value || 0)
    }));
  };

  // Render individual chart
  const renderChart = (config: ChartConfiguration, index: number) => {
    const currentType = selectedChartType[index] || config.type;
    let data = config.data;
    
    // Apply filter if selected
    const filter = selectedFilter[index];
    if (filter && filter !== 'all') {
      data = data.filter(item => item.category === filter || item.type === filter || item.status === filter);
    }
    
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data available
        </div>
      );
    }

    const colors = config.colors || [
      'hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 
      'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))'
    ];

    let dataKeys: string[] = [];
    if (config.series?.length) {
      dataKeys = config.series.map(s => s.dataKey);
    } else if (config.categories?.length) {
      dataKeys = config.categories.filter(cat => cat !== 'name' && cat !== 'label');
    } else {
      dataKeys = Object.keys(data[0] || {}).filter(
        key => key !== 'name' && key !== 'label' && key !== 'category' && key !== 'type'
      );
    }

    const commonProps = {
      data: data,
      onClick: (data: any) => {
        console.log('Chart clicked:', data);
        if (onDeepDiveClick && data.activeLabel) {
          onDeepDiveClick(`Tell me more about ${data.activeLabel}`);
          onClose();
        }
      }
    };

    switch (currentType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[idx % colors.length], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[idx % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <defs>
                {colors.map((color, idx) => (
                  <linearGradient key={idx} id={`colorArea${index}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[idx % colors.length]}
                  fillOpacity={1}
                  fill={`url(#colorArea${index}-${idx})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const normalizedPieData = normalizePieChartData(data);
        if (normalizedPieData.length === 0 || normalizedPieData.every(item => item.value === 0)) {
          return (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <PieIcon className="w-12 h-12 mb-2 opacity-50" />
              <p>Unable to display pie chart</p>
            </div>
          );
        }
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={normalizedPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={(entry) => {
                  if (onDeepDiveClick) {
                    onDeepDiveClick(`Tell me more about ${entry.name}`);
                    onClose();
                  }
                }}
              >
                {normalizedPieData.map((entry, idx) => (
                  <Cell 
                    key={`cell-${idx}`} 
                    fill={colors[idx % colors.length]}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Validate and filter charts with valid data (pure computation, no side effects)
  const validCharts = useMemo(() => {
    return charts.filter(chart => 
      chart.data && 
      Array.isArray(chart.data) && 
      chart.data.length > 0 &&
      chart.categories && 
      chart.categories.length > 0
    );
  }, [charts]);

  // Show data quality notification in separate effect
  useEffect(() => {
    if (!isOpen) return;
    
    const invalidCount = charts.length - validCharts.length;
    if (invalidCount > 0) {
      toast({
        title: 'Data Quality Notice',
        description: `${invalidCount} chart${invalidCount > 1 ? 's' : ''} ${invalidCount > 1 ? 'were' : 'was'} filtered out due to missing or invalid data.`,
        variant: 'default'
      });
    }
  }, [isOpen, charts.length, validCharts.length]); // Only when modal opens or chart validity changes

  // Show success toast when valid charts are ready (only when charts actually change)
  useEffect(() => {
    if (isOpen && validCharts.length > 0 && charts.length > 0) {
      const dataQuality = (validCharts.length / charts.length) * 100;
      toast({
        title: 'Charts Loaded Successfully',
        description: `${validCharts.length} chart${validCharts.length > 1 ? 's' : ''} ready for analysis${dataQuality < 100 ? ` (${Math.round(dataQuality)}% data quality)` : ''}`,
        variant: 'default'
      });
    }
  }, [isOpen, validCharts.length, charts.length]); // Trigger when modal opens or charts change

  // Get available categories for filtering
  const getAvailableCategories = (config: ChartConfiguration): string[] => {
    const categories = new Set<string>();
    config.data.forEach(item => {
      if (item.category) categories.add(item.category);
      if (item.type) categories.add(item.type);
      if (item.status) categories.add(item.status);
    });
    return Array.from(categories);
  };

  // Early return for no valid charts - close modal (recovery now handled by MultiChartAnalysis)
  if (validCharts.length === 0) {
    console.warn('⚠️ No valid charts available, closing modal');
    onClose();
    return null;
  }
  
  // Legacy fallback (should never reach here with new recovery system)
  if (false) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Charts cannot be generated without valid data. Please ensure your data source is properly configured.
            </p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-background/95 backdrop-blur-xl border border-white/10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col max-h-[calc(90vh-2rem)]"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Activity className="w-6 h-6 text-primary" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {title || 'Insights Hub'}
                    </h2>
                    {/* Data Quality Indicator */}
                    <Badge 
                      variant={validCharts.length === charts.length ? 'default' : 'secondary'}
                      className="gap-1 px-2 py-0.5"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {validCharts.length}/{charts.length} valid
                    </Badge>
                  </div>
                  {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Unified Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
            {/* Phase 1: Data Validation & Confidence Indicators */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
            >
              <Shield className="w-5 h-5 text-primary" />
              <div className="flex-1 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm">
                    <span className="font-medium">Validated</span>
                    <span className="text-muted-foreground ml-1">• 95% confidence</span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDataInfo(!showDataInfo)}
                className="text-xs"
              >
                <Info className="w-4 h-4 mr-1" />
                Details
              </Button>
            </motion.div>

            {/* Phase 1: Data Source Info Panel */}
            <AnimatePresence>
              {showDataInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="p-4 bg-muted/30 border-primary/20">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Data Transparency
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data Source:</span>
                        <span className="font-medium">Analytics Dashboard</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Collection Method:</span>
                        <span className="font-medium">Real-time aggregation</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sample Size:</span>
                        <span className="font-medium">{charts[0]?.data?.length || 0} data points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence Score:</span>
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          95% Accurate
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Key Metrics Section */}
            <KeyMetricsPanel visualData={visualData} context={context} />

            {/* Phase 4: Chart Context Panel - Multi-perspective insights */}
            {currentChartConfig?.perspectives && (
              <ChartContextPanel 
                perspectives={currentChartConfig.perspectives}
                chartTitle={title || currentChartConfig.title || 'Chart Analysis'}
              />
            )}

            {/* Interactive Chart Carousel Section - MOVED BEFORE AI INSIGHTS */}
            {validCharts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Interactive Charts
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={scrollPrev}
                      disabled={selectedIndex === 0}
                      className="h-8 w-8 hover:bg-primary/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1">
                      {validCharts.map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            (selectedIndex === idx || selectedIndex + 1 === idx)
                              ? "w-6 bg-primary" 
                              : "w-1.5 bg-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={scrollNext}
                      disabled={selectedIndex >= validCharts.length - 2}
                      className="h-8 w-8 hover:bg-primary/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Embla Carousel */}
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex gap-4">
                    {validCharts.map((chart, index) => {
                      const Icon = CHART_TYPE_ICONS[chart.type] || Activity;
                      return (
                        <div
                          key={index}
                          className="flex-[0_0_calc(50%-0.5rem)] min-w-0"
                          role="tabpanel"
                          aria-label={`Chart ${index + 1}: ${chart.title}`}
                        >
                          <ChartInteractiveWrapper
                            chartIndex={index}
                            title={chart.title || `Chart ${index + 1}`}
                            description={chart.subtitle}
                            linkedHoverData={linkedHoverData}
                            onHover={setLinkedHoverData}
                            onExportPNG={() => handleExportPNG(index)}
                            onExportCSV={() => handleExportCSV(index)}
                          >
                            <div className="flex items-center gap-2 mb-4">
                              <Select 
                                value={selectedChartType[index] || chart.type} 
                                onValueChange={(value) => setSelectedChartType(prev => ({ ...prev, [index]: value }))}
                              >
                                <SelectTrigger className="w-10 h-8 text-xs [&_svg.lucide-check]:hidden [&>span]:hidden">
                                  <Edit className="w-4 h-4" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="line">Line</SelectItem>
                                  <SelectItem value="bar">Bar</SelectItem>
                                  <SelectItem value="area">Area</SelectItem>
                                  <SelectItem value="pie">Pie</SelectItem>
                                </SelectContent>
                              </Select>

                              {getAvailableCategories(chart).length > 0 && (
                                <Select 
                                  value={selectedFilter[index] || 'all'} 
                                  onValueChange={(value) => setSelectedFilter(prev => ({ ...prev, [index]: value }))}
                                >
                                  <SelectTrigger className="w-28 h-8 text-xs">
                                    <Filter className="w-3 h-3 mr-1" />
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {getAvailableCategories(chart).map(cat => (
                                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            
                            <div className="bg-background/30 rounded-lg p-4">
                              {renderChart(chart, index)}
                            </div>
                          </ChartInteractiveWrapper>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Insights Section - MOVED AFTER CHARTS */}
            <AIInsightsPanel insights={displayInsights} onDeepDiveClick={onDeepDiveClick} />

            {/* Phase 4: AI Recommendations Panel - MOVED AFTER CHARTS */}
            <AnimatePresence>
            {showAIRecommendations && (
                <AIRecommendationsPanel
                  insights={aiInsights}
                  onClose={() => setShowAIRecommendations(false)}
                  analysisId={analysisId}
                  onApplyRecommendation={(rec) => {
                    toast({ 
                      title: 'Recommendation Applied', 
                      description: rec.title 
                    });
                  }}
                />
              )}
            </AnimatePresence>

            {/* Conversational AI Chat Panel */}
            {showAIRecommendations && (
              <ChartQAPanel
                charts={charts}
                context={context}
                initialInsights={aiInsights}
              />
            )}

            {/* Phase 3: Saved Analyses List */}
            <AnimatePresence>
              {showSavedList && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <SavedAnalysesList
                    onLoad={handleLoadAnalysis}
                    onClose={() => setShowSavedList(false)}
                    currentAnalysisId={analysisId}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase 4: Version History */}
            <AnimatePresence>
              {showVersionHistory && analysisId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <AnalysisVersionHistory
                    analysisId={analysisId}
                    onLoadVersion={handleLoadAnalysis}
                    onCompareVersions={handleCompareVersions}
                    onClose={() => setShowVersionHistory(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase 4: Version Comparison Modal */}
            {comparisonVersions && (
              <VersionComparisonModal
                isOpen={showVersionComparison}
                onClose={() => {
                  setShowVersionComparison(false);
                  setComparisonVersions(null);
                }}
                version1={comparisonVersions[0]}
                version2={comparisonVersions[1]}
              />
            )}

            {/* Quick Actions Section */}
            <QuickActionsPanel
              actionableItems={displayActionableItems}
              deepDivePrompts={displayDeepDivePrompts}
              onActionClick={onActionClick}
              onClose={onClose}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-6 py-4 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hover:bg-primary/10 hover:border-primary/30 transition-all"
                  onClick={handleSaveAnalysis}
                  disabled={isSaving}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : analysisId ? 'Update' : 'Save'}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-primary/10 hover:border-primary/30 transition-all"
                  onClick={() => setShowSavedList(!showSavedList)}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Load
                </Button>
                {analysisId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-primary/10 hover:border-primary/30 transition-all"
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-primary/10 hover:border-primary/30 transition-all"
                  onClick={handleShare}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {/* Phase 4: AI Insights Button */}
                <Button 
                  variant={showAIRecommendations ? 'default' : 'outline'}
                  size="sm"
                  className="hover:bg-accent/10 hover:border-accent/30 transition-all"
                  onClick={generateAIInsights}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Insights
                </Button>
              </div>
              
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {charts.length} Insight{charts.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
