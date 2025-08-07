import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X, BarChart3, TrendingUp, Users, Clock, Headphones, DollarSign } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { DropdownWithOther } from '../shared/DropdownWithOther';

interface AnalyticsTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  formData,
  updateFormData
}) => {
  const metrics = formData.metrics || {};
  const [newMetricType, setNewMetricType] = useState('');
  const [customMetricType, setCustomMetricType] = useState('');

  const updateMetrics = (updates: any) => {
    updateFormData({
      metrics: {
        ...metrics,
        ...updates
      }
    });
  };

  // Metric type options
  const metricTypeOptions = [
    { value: 'adoption-rate', label: 'Adoption Rate' },
    { value: 'satisfaction', label: 'Customer Satisfaction' },
    { value: 'roi', label: 'Return on Investment' },
    { value: 'implementation-time', label: 'Implementation Time' },
    { value: 'support-response', label: 'Support Response Time' },
    { value: 'uptime', label: 'System Uptime' },
    { value: 'conversion-rate', label: 'Conversion Rate' },
    { value: 'churn-rate', label: 'Churn Rate' }
  ];

  const MetricCard = ({ 
    title, 
    icon: Icon, 
    value, 
    field, 
    placeholder,
    description 
  }: {
    title: string;
    icon: React.ElementType;
    value: string;
    field: string;
    placeholder: string;
    description: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => updateMetrics({ [field]: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Adoption Rate"
          icon={TrendingUp}
          value={metrics.adoptionRate || ''}
          field="adoptionRate"
          placeholder="e.g., 85% in first quarter"
          description="How quickly customers adopt your solution"
        />

        <MetricCard
          title="Customer Satisfaction"
          icon={Users}
          value={metrics.customerSatisfaction || ''}
          field="customerSatisfaction"
          placeholder="e.g., 4.8/5 stars, 95% satisfaction"
          description="Customer satisfaction scores and ratings"
        />

        <MetricCard
          title="ROI for Customers"
          icon={DollarSign}
          value={metrics.roi || ''}
          field="roi"
          placeholder="e.g., 300% ROI within 6 months"
          description="Return on investment for your customers"
        />

        <MetricCard
          title="Implementation Time"
          icon={Clock}
          value={metrics.implementationTime || ''}
          field="implementationTime"
          placeholder="e.g., 2-4 weeks average"
          description="Time required for full implementation"
        />

        <MetricCard
          title="Support Response Time"
          icon={Headphones}
          value={metrics.supportResponse || ''}
          field="supportResponse"
          placeholder="e.g., <2 hours average response"
          description="Average support response time"
        />
      </div>

      {/* Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Analytics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track how your solution is being used and performing
          </p>
        </CardHeader>
        <CardContent>
          {metrics.usageAnalytics && metrics.usageAnalytics.length > 0 ? (
            <div className="space-y-4">
              {metrics.usageAnalytics.map((analytic: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{analytic.metric}</div>
                    <div className="text-2xl font-bold text-primary">{analytic.value}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={analytic.trend === 'up' ? 'default' : analytic.trend === 'down' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {analytic.trend === 'up' && '↗'}
                      {analytic.trend === 'down' && '↘'}
                      {analytic.trend === 'stable' && '→'}
                      {analytic.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No usage analytics configured yet</p>
              <p className="text-xs mt-1">Analytics data would be populated from your actual usage metrics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Overall performance and key insights about your solution
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Adoption Rate</div>
              <div className="text-2xl font-bold text-green-600">{metrics.adoptionRate || 'N/A'}</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
              <div className="text-2xl font-bold text-blue-600">{metrics.customerSatisfaction || 'N/A'}</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Average ROI</div>
              <div className="text-2xl font-bold text-purple-600">{metrics.roi || 'N/A'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Data Collection Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Analytics Integration:</strong> Consider integrating with analytics platforms 
              like Google Analytics, Mixpanel, or your internal metrics dashboard.
            </p>
            <p>
              <strong>Customer Feedback:</strong> Regularly collect customer feedback through 
              surveys, NPS scores, and support interactions.
            </p>
            <p>
              <strong>Performance Monitoring:</strong> Track system performance, uptime, 
              and user engagement metrics continuously.
            </p>
            <p>
              <strong>ROI Calculation:</strong> Work with customers to measure and document 
              the tangible benefits and cost savings achieved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};