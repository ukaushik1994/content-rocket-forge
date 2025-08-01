
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Calculator, DollarSign, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface ROICalculatorProps {
  goals: any;
  serpMetrics: any;
}

export const ROICalculator = ({ goals, serpMetrics }: ROICalculatorProps) => {
  const [investment, setInvestment] = useState({
    contentCreation: '5000',
    toolsAndSoftware: '500',
    advertising: '2000',
    teamCosts: '8000'
  });

  const [metrics, setMetrics] = useState({
    conversionRate: '2.5',
    averageOrderValue: '150',
    customerLifetimeValue: '800'
  });

  const calculateROI = () => {
    const totalInvestment = Object.values(investment).reduce((acc, val) => acc + parseFloat(val || '0'), 0);
    const estimatedTraffic = serpMetrics ? Math.floor(serpMetrics.searchVolume * 0.1) : 2500;
    const conversions = estimatedTraffic * (parseFloat(metrics.conversionRate) / 100);
    const revenue = conversions * parseFloat(metrics.averageOrderValue);
    const roi = ((revenue - totalInvestment) / totalInvestment) * 100;

    return {
      totalInvestment,
      estimatedTraffic,
      conversions,
      revenue,
      roi,
      profitLoss: revenue - totalInvestment
    };
  };

  const results = calculateROI();

  const investmentCategories = [
    { key: 'contentCreation', label: 'Content Creation', icon: '📝', color: 'from-blue-500 to-cyan-500' },
    { key: 'toolsAndSoftware', label: 'Tools & Software', icon: '🛠️', color: 'from-purple-500 to-pink-500' },
    { key: 'advertising', label: 'Paid Advertising', icon: '📢', color: 'from-green-500 to-emerald-500' },
    { key: 'teamCosts', label: 'Team & Labor', icon: '👥', color: 'from-orange-500 to-red-500' }
  ];

  const metricCategories = [
    { key: 'conversionRate', label: 'Conversion Rate (%)', icon: '🎯' },
    { key: 'averageOrderValue', label: 'Average Order Value ($)', icon: '💰' },
    { key: 'customerLifetimeValue', label: 'Customer LTV ($)', icon: '⭐' }
  ];

  return (
    <Card className="glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Calculator className="h-6 w-6 text-green-400" />
          </div>
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            ROI Calculator
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Investment Breakdown
              </h3>
              <div className="grid gap-4">
                {investmentCategories.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.label}
                    </Label>
                    <Input
                      type="number"
                      value={investment[category.key as keyof typeof investment]}
                      onChange={(e) => setInvestment({
                        ...investment,
                        [category.key]: e.target.value
                      })}
                      className="bg-glass border-white/10 focus:border-green-400"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                Business Metrics
              </h3>
              <div className="grid gap-4">
                {metricCategories.map((metric) => (
                  <div key={metric.key} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <span>{metric.icon}</span>
                      {metric.label}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={metrics[metric.key as keyof typeof metrics]}
                      onChange={(e) => setMetrics({
                        ...metrics,
                        [metric.key]: e.target.value
                      })}
                      className="bg-glass border-white/10 focus:border-blue-400"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              ROI Projection
            </h3>

            {/* Key Results */}
            <div className="grid gap-4">
              <motion.div 
                className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {results.roi > 0 ? '+' : ''}{results.roi.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">Return on Investment</div>
              </motion.div>

              <motion.div 
                className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  ${results.profitLoss.toFixed(0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">
                  {results.profitLoss > 0 ? 'Projected Profit' : 'Projected Loss'}
                </div>
              </motion.div>

              <motion.div 
                className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  ${results.revenue.toFixed(0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Projected Revenue</div>
              </motion.div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-medium text-white mb-3">Performance Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Investment:</span>
                    <span className="text-white font-medium">${results.totalInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Estimated Traffic:</span>
                    <span className="text-white font-medium">{results.estimatedTraffic.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Estimated Conversions:</span>
                    <span className="text-white font-medium">{Math.floor(results.conversions)}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Monthly Revenue:</span>
                    <span className="text-white font-medium">${Math.floor(results.revenue).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* ROI Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">ROI Target: 300%</span>
                  <span className="text-white font-medium">{Math.max(0, results.roi).toFixed(1)}%</span>
                </div>
                <Progress value={Math.min((results.roi / 300) * 100, 100)} className="h-3" />
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
              <h4 className="font-medium text-yellow-400 mb-2">💡 Optimization Tips</h4>
              <ul className="text-sm text-white/80 space-y-1">
                {results.roi < 100 && <li>• Consider reducing investment or improving conversion rates</li>}
                {results.roi > 200 && <li>• Excellent ROI! Consider scaling your investment</li>}
                <li>• Focus on high-converting content formats</li>
                <li>• Monitor and optimize conversion funnel</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
