import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  MousePointer, 
  BarChart3, 
  Target, 
  Edit, 
  Key, 
  Search,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContentAnalyticsCardProps {
  contentId: string;
  title: string;
  publishedUrl?: string;
  mainKeyword?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
}

const getStatusVariant = (ctr: number, position: number): { label: string; className: string } => {
  if (ctr > 2 && position < 10) {
    return { 
      label: 'Performing Well', 
      className: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-300' 
    };
  }
  
  if (ctr < 2 || position > 20) {
    return { 
      label: 'Needs Optimization', 
      className: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-300' 
    };
  }
  
  if (ctr < 1 && position > 30) {
    return { 
      label: 'Underperforming', 
      className: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/40 text-red-300' 
    };
  }
  
  return { 
    label: 'Average', 
    className: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-300' 
  };
};

export const ContentAnalyticsCard: React.FC<ContentAnalyticsCardProps> = ({
  contentId,
  title,
  publishedUrl,
  mainKeyword,
  impressions,
  clicks,
  ctr,
  averagePosition
}) => {
  const navigate = useNavigate();
  const status = getStatusVariant(ctr * 100, averagePosition);

  const handleEditMeta = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/content-builder/${contentId}?tab=meta`);
  };

  const handleAddKeywords = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/content-builder/${contentId}?tab=keywords`);
  };

  const handleCheckSERP = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mainKeyword) {
      navigate(`/research/serp?keyword=${encodeURIComponent(mainKeyword)}&contentId=${contentId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="glass-panel bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground/90 line-clamp-2 flex-1">
                {title}
              </h3>
              <Badge className={`${status.className} shrink-0`}>
                {status.label}
              </Badge>
            </div>
            
            {/* URL & Quick Links */}
            <div className="flex items-center gap-2 flex-wrap">
              {publishedUrl && (
                <a 
                  href={publishedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-[200px]"
                >
                  {publishedUrl}
                </a>
              )}
              <div className="flex gap-2 ml-auto">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-500/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (publishedUrl) window.open(`https://analytics.google.com/analytics/web/#/p/YOUR_PROPERTY_ID/reports/explorer?params=_u.date00%3D20230101%26_u.date01%3D20231231%26_u.filters%3D%255B%257B%2522expression%2522%253A%2522${encodeURIComponent(publishedUrl)}%2522%257D%255D`, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  GA4
                </Badge>
                <Badge 
                  variant="outline"
                  className="cursor-pointer hover:bg-green-500/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (publishedUrl) window.open(`https://search.google.com/search-console?resource_id=${encodeURIComponent(publishedUrl)}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  SC
                </Badge>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Impressions */}
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-blue-500/20">
                  <Eye className="h-3.5 w-3.5 text-blue-400" />
                </div>
              </div>
              <p className="text-xl font-bold text-blue-300">
                {impressions.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Impressions</p>
            </motion.div>

            {/* Clicks */}
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-green-500/20">
                  <MousePointer className="h-3.5 w-3.5 text-green-400" />
                </div>
              </div>
              <p className="text-xl font-bold text-green-300">
                {clicks.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Clicks</p>
            </motion.div>

            {/* CTR */}
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-purple-500/20">
                  <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
                </div>
              </div>
              <p className="text-xl font-bold text-purple-300">
                {(ctr * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">CTR</p>
            </motion.div>

            {/* Position */}
            <motion.div 
              className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-orange-500/20">
                  <Target className="h-3.5 w-3.5 text-orange-400" />
                </div>
              </div>
              <p className="text-xl font-bold text-orange-300">
                {averagePosition.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Position</p>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/30">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-primary/10 to-blue-500/10 hover:from-primary/20 hover:to-blue-500/20 border-primary/30"
              onClick={handleEditMeta}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit Meta
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/30"
              onClick={handleAddKeywords}
            >
              <Key className="h-3.5 w-3.5 mr-1.5" />
              Keywords
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-500/30"
              onClick={handleCheckSERP}
              disabled={!mainKeyword}
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Check SERP
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
