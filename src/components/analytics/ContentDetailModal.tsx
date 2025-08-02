
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Eye, 
  Clock, 
  MousePointer, 
  TrendingUp, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    views: number;
    engagement: string;
    performance: number;
    revenue: string;
  } | null;
}

// NOTE: This component is deprecated. Use RealTimeContentAnalytics instead.

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  isOpen,
  onClose,
  content
}) => {
  console.warn('ContentDetailModal is deprecated. Use RealTimeContentAnalytics instead.');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Component Deprecated
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 text-center">
          <p className="text-slate-400 mb-4">
            This component has been deprecated. Please use the new RealTimeContentAnalytics component for live data integration.
          </p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
