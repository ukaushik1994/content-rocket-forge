import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  ArrowRight,
  Zap,
  RefreshCw,
  ChevronRight,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface OpportunityItem {
  title: string;
  type: 'opportunity' | 'ai-strategy' | 'dashboard';
  description?: string;
  keywords?: string[];
  volume?: number;
  difficulty?: number;
  priority?: string;
  content_format?: string;
  cta?: string;
  createdAt?: string;
}

interface EnhancedOpportunitiesDisplayProps {
  opportunities: OpportunityItem[];
  totalCount: number;
  loading?: boolean;
  onRefresh?: () => void;
}

export const EnhancedOpportunitiesDisplay: React.FC<EnhancedOpportunitiesDisplayProps> = ({
  opportunities,
  totalCount,
  loading = false,
  onRefresh
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const getOpportunityTypeIcon = (type: 'opportunity' | 'ai-strategy' | 'dashboard') => {
    switch (type) {
      case 'opportunity': return <Target className="w-4 h-4" />;
      case 'ai-strategy': return <Zap className="w-4 h-4" />;
      case 'dashboard': return <Lightbulb className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-400/30';
      default: return 'text-white/80 bg-white/10 border-white/20';
    }
  };

  const handleOpportunityClick = (item: OpportunityItem) => {
    switch (item.type) {
      case 'opportunity':
        navigate('/research/opportunities');
        break;
      case 'ai-strategy':
        navigate('/research/content-strategy#strategies');
        break;
      case 'dashboard':
        // Handle existing dashboard moves
        break;
    }
  };

  const nextOpportunity = () => {
    setCurrentIndex((prev) => (prev + 1) % opportunities.length);
  };

  const prevOpportunity = () => {
    setCurrentIndex((prev) => (prev - 1 + opportunities.length) % opportunities.length);
  };

  if (loading) {
    return (
      <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-neon-blue animate-spin" />
            <div className="space-y-1">
              <div className="h-4 bg-white/10 rounded w-48 animate-pulse" />
              <div className="h-3 bg-white/10 rounded w-32 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group overflow-hidden relative">
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(255,20,147,0.1), rgba(138,43,226,0.1), rgba(30,144,255,0.1))",
              "linear-gradient(135deg, rgba(30,144,255,0.1), rgba(255,20,147,0.1), rgba(138,43,226,0.1))",
              "linear-gradient(135deg, rgba(138,43,226,0.1), rgba(30,144,255,0.1), rgba(255,20,147,0.1))",
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <CardHeader className="relative z-10 pb-4">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-pink/30 to-neon-blue/30 flex items-center justify-center backdrop-blur-xl border border-white/20">
                <Lightbulb className="w-5 h-5 text-neon-pink" />
              </div>
              <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                Content Opportunities
              </span>
            </div>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
          <CardDescription className="text-white/60 ml-13">
            {totalCount > 0 
              ? `${totalCount} content opportunities available` 
              : "No opportunities available"}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">
          {opportunities.length > 0 ? (
            <div className="space-y-4">
              {/* Current Opportunity Display */}
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => handleOpportunityClick(opportunities[currentIndex])}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      opportunities[currentIndex].type === 'opportunity' ? 'bg-neon-blue/20 text-neon-blue' :
                      opportunities[currentIndex].type === 'ai-strategy' ? 'bg-neon-purple/20 text-neon-purple' :
                      'bg-neon-pink/20 text-neon-pink'
                    }`}>
                      {getOpportunityTypeIcon(opportunities[currentIndex].type)}
                    </div>
                    <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                      {opportunities[currentIndex].type === 'opportunity' ? 'Opportunity' : 
                       opportunities[currentIndex].type === 'ai-strategy' ? 'AI Strategy' : 'Dashboard'}
                    </Badge>
                  </div>
                  {opportunities[currentIndex].priority && (
                    <Badge className={`text-xs ${getPriorityColor(opportunities[currentIndex].priority)}`}>
                      {opportunities[currentIndex].priority}
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-white/90 mb-2 line-clamp-2">
                  {opportunities[currentIndex].title}
                </h3>

                {opportunities[currentIndex].description && (
                  <p className="text-sm text-white/60 mb-3 line-clamp-2">
                    {opportunities[currentIndex].description}
                  </p>
                )}

                {opportunities[currentIndex].keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {opportunities[currentIndex].keywords.slice(0, 3).map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-white/10 text-white/50 bg-white/5">
                        {keyword}
                      </Badge>
                    ))}
                    {opportunities[currentIndex].keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs border-white/10 text-white/40 bg-white/5">
                        +{opportunities[currentIndex].keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    {opportunities[currentIndex].volume && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {opportunities[currentIndex].volume > 1000 ? 
                          `${(opportunities[currentIndex].volume / 1000).toFixed(1)}k` : 
                          opportunities[currentIndex].volume}
                      </span>
                    )}
                    {opportunities[currentIndex].difficulty !== undefined && (
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {opportunities[currentIndex].difficulty}/100
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-neon-blue transition-colors duration-300" />
                </div>
              </motion.div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevOpportunity}
                    disabled={opportunities.length <= 1}
                    className="border-white/20 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
                  >
                    ←
                  </Button>
                  <span className="text-xs text-white/50">
                    {currentIndex + 1} of {opportunities.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextOpportunity}
                    disabled={opportunities.length <= 1}
                    className="border-white/20 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
                  >
                    →
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/research/content-strategy')}
                  className="border-white/20 bg-white/10 hover:bg-white/20 text-white gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View All
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Lightbulb className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-white/60 mb-2">No content opportunities found</p>
              <p className="text-sm text-white/40 mb-4">
                Start by creating a content strategy to discover opportunities
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white"
                onClick={() => navigate('/research/content-strategy')}
              >
                Get Started
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};