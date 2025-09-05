import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, ExternalLink, Settings, AlertCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
interface AnalyticsConnectionPromptProps {
  hasGoogleAnalytics: boolean;
  hasSearchConsole: boolean;
  hasPublishedContent: boolean;
  className?: string;
}
export const AnalyticsConnectionPrompt = ({
  hasGoogleAnalytics,
  hasSearchConsole,
  hasPublishedContent,
  className = ""
}: AnalyticsConnectionPromptProps) => {
  const missingAnalytics = !hasGoogleAnalytics;
  const missingSearchConsole = !hasSearchConsole;
  const needsContent = !hasPublishedContent;
  if (hasGoogleAnalytics && hasSearchConsole && hasPublishedContent) {
    return null;
  }
  return;
};