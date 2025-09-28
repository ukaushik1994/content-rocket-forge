
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface DrilldownChartProps {
  title: string;
  data: any[];
  metric: string;
  timeRange: string;
  onBack: () => void;
}

export const DrilldownChart: React.FC<DrilldownChartProps> = ({
  title,
  data,
  metric,
  timeRange,
  onBack
}) => {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Use real data or fallback to mock data
  const chartData = data.length > 0 ? data : [
    { date: '2024-01-01', value: 1200, change: 5.2 },
    { date: '2024-01-02', value: 1450, change: 20.8 },
    { date: '2024-01-03', value: 1380, change: -4.8 },
    { date: '2024-01-04', value: 1620, change: 17.4 },
    { date: '2024-01-05', value: 1890, change: 16.7 },
    { date: '2024-01-06', value: 2100, change: 11.1 },
    { date: '2024-01-07', value: 1950, change: -7.1 }
  ];

  const formatValue = (value: number | undefined | null) => {
    // Handle undefined/null values
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    
    if (metric === 'engagement') return `${value}%`;
    return value.toLocaleString();
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(change)}%
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">{title} Deep Dive</h2>
            <p className="text-slate-400">Detailed analysis for {timeRange}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{timeRange}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border-slate-600/30">
          <CardHeader>
            <CardTitle className="text-white">Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} onClick={(e) => setSelectedPoint(e?.activePayload?.[0]?.payload)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#94a3b8" tickFormatter={formatValue} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any) => [formatValue(value), title]}
                />
                <Line 
                  type="monotone" 
                  dataKey={metric === 'views' ? 'views' : metric === 'engagement' ? 'engagement' : 'value'} 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#1e40af' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Data Points */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-600/30">
          <CardHeader>
            <CardTitle className="text-white text-lg">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {chartData.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPoint?.date === point.date 
                      ? 'bg-blue-500/20 border-blue-500/50' 
                      : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedPoint(point)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">
                      {new Date(point.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    {point.change !== undefined && formatChange(point.change)}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatValue(point[metric === 'views' ? 'views' : metric === 'engagement' ? 'engagement' : 'value'] || point.value)}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Point Details */}
      {selectedPoint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-600/30">
            <CardHeader>
              <CardTitle className="text-white">
                Details for {new Date(selectedPoint.date).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Value</p>
                  <p className="text-2xl font-bold text-white">
                    {formatValue(selectedPoint[metric === 'views' ? 'views' : metric === 'engagement' ? 'engagement' : 'value'] || selectedPoint.value)}
                  </p>
                </div>
                {selectedPoint.change !== undefined && (
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm">Change from Previous</p>
                    <div className="text-xl font-bold">
                      {formatChange(selectedPoint.change)}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Performance</p>
                  <div className={`text-lg font-medium ${
                    (selectedPoint.change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {(selectedPoint.change || 0) >= 0 ? 'Above Average' : 'Below Average'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
