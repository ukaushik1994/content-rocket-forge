import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { SmartDataViewer } from './SmartDataViewer';
import {
  FileText,
  TrendingUp,
  Eye,
  Users,
  Calendar,
  Target,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  icon?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
}

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  categories?: string[];
  series?: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  colors?: string[];
  height?: number;
}

interface ActionButton {
  id: string;
  label: string;
  type: 'button' | 'card' | 'workflow';
  variant?: 'primary' | 'secondary' | 'default' | 'outline';
  description?: string;
  data?: any;
}

interface VisualData {
  type: 'metrics' | 'chart' | 'table' | 'progress' | 'summary' | 'workflow';
  metrics?: MetricData[];
  chartConfig?: ChartData;
  tableData?: { headers: string[]; rows: any[][] };
  progressSteps?: { id: string; title: string; completed: boolean }[];
  summary?: {
    title: string;
    items: Array<{
      label: string;
      value: string;
      status: 'good' | 'warning' | 'needs-attention';
    }>;
  };
  workflowStep?: {
    id: string;
    title: string;
    description: string;
    progress?: {
      current: number;
      total: number;
    };
  };
}

interface RichMediaRendererProps {
  visualData?: VisualData;
  actions?: ActionButton[];
  onActionClick?: (action: ActionButton) => void;
}

const iconMap = {
  filetext: FileText,
  trending: TrendingUp,
  eye: Eye,
  users: Users,
  calendar: Calendar,
  target: Target,
  check: CheckCircle,
  alert: AlertCircle,
  info: Info
};

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export const RichMediaRenderer: React.FC<RichMediaRendererProps> = ({
  visualData,
  actions = [],
  onActionClick
}) => {
  const renderMetrics = (metrics: MetricData[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon ? iconMap[metric.icon as keyof typeof iconMap] : FileText;
        
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                  </div>
                </div>
                {metric.change && (
                  <div className="mt-3 flex items-center gap-1 text-xs">
                    <span className={`flex items-center gap-1 ${
                      metric.change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {metric.change.value > 0 ? '+' : ''}{metric.change.value}%
                    </span>
                    <span className="text-muted-foreground">{metric.change.period}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  const renderChart = (config: ChartData) => {
    const chartHeight = config.height || 300;
    
    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {config.categories?.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {config.categories?.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  fill={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {config.categories?.map((category, index) => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stackId="1"
                  stroke={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                  fill={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {config.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  const renderTable = (tableData: { headers: string[]; rows: any[][] }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr className="bg-muted/50">
            {tableData.headers.map((header, index) => (
              <th key={index} className="border border-border p-3 text-left text-sm font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/30">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-border p-3 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProgress = (steps: { id: string; title: string; completed: boolean }[]) => (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3"
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            step.completed 
              ? 'bg-green-500 text-white' 
              : 'bg-muted border-2 border-muted-foreground'
          }`}>
            {step.completed ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <span className="text-xs">{index + 1}</span>
            )}
          </div>
          <span className={`text-sm ${step.completed ? 'text-green-600' : ''}`}>
            {step.title}
          </span>
        </motion.div>
      ))}
    </div>
  );

  const renderSummary = (summary: { title: string; items: Array<{ label: string; value: string; status: 'good' | 'warning' | 'needs-attention' }> }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{summary.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {summary.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.value}</span>
                <Badge variant={
                  item.status === 'good' ? 'default' : 
                  item.status === 'warning' ? 'secondary' : 
                  'destructive'
                }>
                  {item.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkflow = (workflow: { id: string; title: string; description: string; progress?: { current: number; total: number } }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          {workflow.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
        {workflow.progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{workflow.progress.current} of {workflow.progress.total}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(workflow.progress.current / workflow.progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderActions = (actionList: ActionButton[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {actionList.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {action.type === 'card' ? (
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onActionClick?.(action)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{action.label}</CardTitle>
              </CardHeader>
              {action.description && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              )}
            </Card>
          ) : (
            <Button
              variant={action.variant === 'primary' ? 'default' : action.variant || 'outline'}
              onClick={() => onActionClick?.(action)}
              className="w-full justify-start"
              size="sm"
            >
              {action.label}
              {action.type === 'workflow' && <ArrowRight className="h-3 w-3 ml-auto" />}
            </Button>
          )}
        </motion.div>
      ))}
    </div>
  );

  if (!visualData && (!actions || actions.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 bg-muted/10 rounded-lg border">
      {/* Visual Data Rendering */}
      {visualData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {visualData.type === 'metrics' && visualData.metrics && renderMetrics(visualData.metrics)}
          
          {/* Chart Rendering with Smart Analysis */}
          {visualData.type === 'chart' && visualData.chartConfig && (
            <SmartDataViewer
              chartConfig={{
                ...visualData.chartConfig,
                categories: visualData.chartConfig.categories || ['name']
              }}
            />
          )}
          
          {visualData.type === 'table' && visualData.tableData && (
            <Card>
              <CardContent className="p-4">
                {renderTable(visualData.tableData)}
              </CardContent>
            </Card>
          )}
          
          {visualData.type === 'progress' && visualData.progressSteps && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {renderProgress(visualData.progressSteps)}
              </CardContent>
            </Card>
          )}

          {visualData.type === 'summary' && visualData.summary && renderSummary(visualData.summary)}
          
          {visualData.type === 'workflow' && visualData.workflowStep && renderWorkflow(visualData.workflowStep)}
        </motion.div>
      )}

      {/* Action Buttons */}
      {actions && actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
          {renderActions(actions)}
        </motion.div>
      )}
    </div>
  );
};