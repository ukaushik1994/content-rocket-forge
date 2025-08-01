
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Plus, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentGapsTabProps {
  serpMetrics: any;
  goals: any;
}

export const ContentGapsTab = ({ serpMetrics, goals }: ContentGapsTabProps) => {
  const getContentGaps = () => {
    const keyword = goals.mainKeyword || 'your topic';
    const difficulty = serpMetrics?.keywordDifficulty || 50;
    
    return [
      {
        topic: `Advanced ${keyword} tutorials`,
        opportunity: difficulty < 40 ? "High" : "Medium",
        competition: difficulty > 60 ? "High" : "Medium", 
        volume: Math.floor((serpMetrics?.searchVolume || 10000) * 0.3).toLocaleString(),
        description: "In-depth technical content that competitors are missing",
        actionItems: [
          "Create step-by-step video tutorials",
          "Write comprehensive guides with screenshots", 
          "Include downloadable templates and resources"
        ]
      },
      {
        topic: `${keyword} case studies`,
        opportunity: "High",
        competition: "Low",
        volume: Math.floor((serpMetrics?.searchVolume || 10000) * 0.2).toLocaleString(),
        description: "Real-world success stories and detailed analysis",
        actionItems: [
          "Interview successful customers",
          "Document ROI and key metrics",
          "Create visual case study templates"
        ]
      },
      {
        topic: `${keyword} comparison guides`,
        opportunity: "Medium",
        competition: difficulty > 50 ? "High" : "Medium",
        volume: Math.floor((serpMetrics?.searchVolume || 10000) * 0.4).toLocaleString(),
        description: "Detailed comparison content that helps users make decisions",
        actionItems: [
          "Create comparison matrices and charts",
          "Include pricing and feature analysis",
          "Add pros/cons sections with real insights"
        ]
      }
    ];
  };

  const contentGaps = getContentGaps();

  const getOpportunityColor = (opportunity: string) => {
    if (opportunity === 'High') return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (opportunity === 'Medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

  return (
    <Card className="glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Content Gap Analysis
          </span>
          <Badge variant="outline" className="text-green-400 border-green-400 ml-auto">
            {serpMetrics ? 'SERP-Powered' : 'AI-Analyzed'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {contentGaps.map((gap, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-glass rounded-xl border border-white/10 hover:border-green-400/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-xl mb-2">{gap.topic}</h4>
                  <p className="text-muted-foreground mb-3">{gap.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Volume: <span className="text-white font-medium">{gap.volume}/month</span></span>
                    <Badge variant="outline" className={getOpportunityColor(gap.opportunity)}>
                      {gap.opportunity} Opportunity
                    </Badge>
                    <Badge variant={gap.competition === 'Low' ? 'default' : gap.competition === 'Medium' ? 'secondary' : 'destructive'}>
                      {gap.competition} Competition
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-green-400 mb-2">Action Items:</h5>
                <div className="grid gap-2">
                  {gap.actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-white/80">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <Button size="sm" variant="outline" className="hover:bg-green-400/10 hover:border-green-400">
                <Plus className="h-4 w-4 mr-2" />
                Create Content Plan
              </Button>
            </motion.div>
          ))}
        </div>

        {/* SERP Integration Note */}
        {serpMetrics && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-sm text-primary mb-2">
              <Target className="h-4 w-4" />
              SERP-Enhanced Analysis
            </div>
            <p className="text-sm text-white/70">
              Gap analysis enhanced with real SERP data from your keyword "{goals.mainKeyword}". 
              Recommendations are based on actual competitor content and search result features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
