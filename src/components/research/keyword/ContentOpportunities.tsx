
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentOpportunitiesProps {
  serpData: any;
  keyword: string;
  onCreateContent: () => void;
}

export const ContentOpportunities: React.FC<ContentOpportunitiesProps> = ({
  serpData,
  keyword,
  onCreateContent
}) => {
  const opportunities = [
    {
      type: 'Featured Snippet',
      description: 'Create content optimized for featured snippet',
      priority: 'High',
      difficulty: 'Medium',
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      available: serpData?.featuredSnippets?.length > 0
    },
    {
      type: 'People Also Ask',
      description: `Answer ${serpData?.peopleAlsoAsk?.length || 0} common questions`,
      priority: 'High',
      difficulty: 'Easy',
      icon: Lightbulb,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      available: (serpData?.peopleAlsoAsk?.length || 0) > 0
    },
    {
      type: 'Content Gaps',
      description: `Fill ${serpData?.contentGaps?.length || 0} content gaps`,
      priority: 'Medium',
      difficulty: 'Medium',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      available: (serpData?.contentGaps?.length || 0) > 0
    },
    {
      type: 'Long-tail Keywords',
      description: `Target ${serpData?.keywords?.length || 0} related terms`,
      priority: 'Medium',
      difficulty: 'Easy',
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      available: (serpData?.keywords?.length || 0) > 0
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 border-red-400';
      case 'Medium': return 'text-yellow-400 border-yellow-400';
      case 'Low': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 border-green-400';
      case 'Medium': return 'text-yellow-400 border-yellow-400';
      case 'Hard': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Strategy Overview */}
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Content Strategy for "{keyword}"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full transition-all duration-300 ${
                  opportunity.available 
                    ? 'hover:border-primary/50 cursor-pointer' 
                    : 'opacity-50'
                }`}>
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 ${opportunity.bgColor} rounded-full flex items-center justify-center mb-3`}>
                      <opportunity.icon className={`h-6 w-6 ${opportunity.color}`} />
                    </div>
                    <h3 className="font-semibold mb-2">{opportunity.type}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {opportunity.description}
                    </p>
                    <div className="flex gap-2 mb-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(opportunity.priority)}`}
                      >
                        {opportunity.priority}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(opportunity.difficulty)}`}
                      >
                        {opportunity.difficulty}
                      </Badge>
                    </div>
                    {opportunity.available && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={onCreateContent}
                      >
                        Create Content
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Gaps */}
        {(serpData?.contentGaps?.length || 0) > 0 && (
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Content Gaps ({serpData.contentGaps.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {serpData.contentGaps.slice(0, 3).map((gap, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border border-white/10"
                >
                  <h4 className="font-medium mb-1">{gap.topic}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{gap.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    Opportunity
                  </Badge>
                </motion.div>
              ))}
              {serpData.contentGaps.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{serpData.contentGaps.length - 3} more opportunities
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Question Opportunities */}
        {(serpData?.peopleAlsoAsk?.length || 0) > 0 && (
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Question Opportunities ({serpData.peopleAlsoAsk.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {serpData.peopleAlsoAsk.slice(0, 3).map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border border-white/10"
                >
                  <p className="font-medium text-sm">{question.question}</p>
                  {question.answer && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {question.answer}
                    </p>
                  )}
                </motion.div>
              ))}
              {serpData.peopleAlsoAsk.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{serpData.peopleAlsoAsk.length - 3} more questions
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Section */}
      <Card className="glass-panel border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Ready to Create Content?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Use this research to create high-performing content that ranks for "{keyword}" and related terms.
            </p>
            <Button 
              onClick={onCreateContent}
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-500 hover:from-blue-500 hover:to-primary"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Content Creation
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};
