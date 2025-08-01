
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, TrendingUp, FileText, Users, HelpCircle } from 'lucide-react';
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
  // Generate content opportunities from SERP analysis
  const generateOpportunities = () => {
    const opportunities = [];

    // Content gap opportunities
    if (serpData?.contentGaps?.length > 0) {
      serpData.contentGaps.slice(0, 4).forEach((gap: any) => {
        opportunities.push({
          type: 'Content Gap',
          title: gap.topic,
          description: gap.description,
          recommendation: gap.recommendation,
          priority: 'High',
          icon: Target,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          source: 'SERP Analysis'
        });
      });
    }

    // People Also Ask opportunities
    if (serpData?.peopleAlsoAsk?.length > 0) {
      const uniqueQuestions = serpData.peopleAlsoAsk.slice(0, 3);
      opportunities.push({
        type: 'FAQ Content',
        title: 'Answer Popular Questions',
        description: `Create comprehensive answers for ${uniqueQuestions.length} frequently asked questions`,
        recommendation: `Address questions like: "${uniqueQuestions[0]?.question || ''}"`,
        priority: 'High',
        icon: HelpCircle,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        source: 'People Also Ask',
        questions: uniqueQuestions.map((q: any) => q.question)
      });
    }

    // Featured snippet opportunities
    if (serpData?.featuredSnippets?.length > 0) {
      opportunities.push({
        type: 'Featured Snippet',
        title: 'Target Featured Snippets',
        description: 'Create content optimized for featured snippet positions',
        recommendation: 'Structure content with clear answers and bullet points',
        priority: 'Medium',
        icon: TrendingUp,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        source: 'Featured Snippets'
      });
    }

    // Entity-based content opportunities
    if (serpData?.entities?.length > 0) {
      const topEntities = serpData.entities.slice(0, 3);
      opportunities.push({
        type: 'Entity Coverage',
        title: 'Cover Key Topics',
        description: `Ensure comprehensive coverage of related entities and concepts`,
        recommendation: `Include detailed sections about: ${topEntities.map((e: any) => e.name).join(', ')}`,
        priority: 'Medium',
        icon: FileText,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        source: 'Entity Analysis'
      });
    }

    // Competitor analysis opportunities
    if (serpData?.topResults?.length > 0) {
      const avgSnippetLength = serpData.topResults.reduce((acc: number, result: any) => 
        acc + (result.snippet?.length || 0), 0) / serpData.topResults.length;
      
      opportunities.push({
        type: 'Competitive Content',
        title: 'Outrank Competitors',
        description: `Analyze top ${serpData.topResults.length} competitors and identify content gaps`,
        recommendation: `Create content longer than average (${Math.round(avgSnippetLength)} chars) with better structure`,
        priority: 'High',
        icon: Users,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        source: 'Competitor Analysis'
      });
    }

    return opportunities;
  };

  const opportunities = generateOpportunities();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-2">Content Opportunities</h2>
        <p className="text-muted-foreground">
          AI-discovered content gaps and optimization opportunities from SERP analysis
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {opportunities.map((opportunity, index) => (
          <motion.div
            key={`${opportunity.type}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-panel border-white/10 hover:border-white/20 transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className={`p-2 ${opportunity.bgColor} rounded-lg`}>
                      <opportunity.icon className={`h-5 w-5 ${opportunity.color}`} />
                    </div>
                    <div>
                      <div className="text-lg">{opportunity.title}</div>
                      <div className="text-xs text-muted-foreground font-normal">{opportunity.type}</div>
                    </div>
                  </span>
                  <Badge className={getPriorityColor(opportunity.priority)}>
                    {opportunity.priority}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {opportunity.description}
                </p>
                
                <div className="bg-glass border border-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Recommendation
                  </h4>
                  <p className="text-sm">{opportunity.recommendation}</p>
                </div>

                {opportunity.questions && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Key Questions to Answer:</h4>
                    {opportunity.questions.slice(0, 2).map((question: string, qIndex: number) => (
                      <div key={qIndex} className="text-xs text-muted-foreground bg-white/5 rounded p-2">
                        "{question}"
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <Badge variant="outline" className="text-xs bg-white/5">
                    {opportunity.source}
                  </Badge>
                  <Button 
                    size="sm" 
                    onClick={onCreateContent}
                    className="bg-gradient-to-r from-primary/20 to-blue-500/20 hover:from-primary/30 hover:to-blue-500/30"
                  >
                    Create Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <Card className="glass-panel border-white/10">
          <CardContent className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No content opportunities found. Run a keyword analysis to discover content gaps and optimization opportunities.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {opportunities.length > 0 && (
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Opportunity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {opportunities.filter(o => o.priority === 'High').length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {opportunities.filter(o => o.priority === 'Medium').length}
                </div>
                <div className="text-sm text-muted-foreground">Medium Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {serpData?.peopleAlsoAsk?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Questions Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {serpData?.contentGaps?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Content Gaps</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
