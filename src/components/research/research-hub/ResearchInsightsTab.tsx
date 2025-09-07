import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Lightbulb, FileSearch, Users, Search, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

export const ResearchInsightsTab: React.FC = () => {
  const { insights, currentStrategy } = useContentStrategy();

  // Mock data for demonstration - in real implementation, this would come from aggregated research
  const researchSessions = [
    {
      id: 1,
      keyword: 'content marketing',
      timestamp: '2 hours ago',
      questionsFound: 24,
      contentGaps: 8,
      opportunities: 12,
      status: 'completed'
    },
    {
      id: 2,
      keyword: 'SEO strategy',
      timestamp: '1 day ago',
      questionsFound: 31,
      contentGaps: 15,
      opportunities: 20,
      status: 'completed'
    },
    {
      id: 3,
      keyword: 'digital marketing',
      timestamp: '3 days ago',
      questionsFound: 18,
      contentGaps: 6,
      opportunities: 9,
      status: 'completed'
    }
  ];

  const topOpportunities = [
    {
      keyword: 'content marketing strategy',
      opportunity: 'High-volume, low-competition keyword',
      searchVolume: '8.1K',
      difficulty: 'Medium',
      type: 'keyword'
    },
    {
      keyword: 'What is content marketing?',
      opportunity: 'High-intent question with 500+ monthly searches',
      searchVolume: '2.4K',
      difficulty: 'Low',
      type: 'question'
    },
    {
      keyword: 'Content creation tools comparison',
      opportunity: 'Gap in competitor content coverage',
      searchVolume: '1.8K',
      difficulty: 'Low',
      type: 'gap'
    }
  ];

  const handleExportReport = () => {
    // Implementation for exporting research report
    console.log('Exporting research report...');
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Description with glassmorphism */}
      <motion.div 
        className="text-center space-y-6 bg-gradient-to-b from-white/5 to-transparent p-8 rounded-2xl border border-white/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 bg-clip-text text-transparent flex items-center justify-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <BarChart3 className="h-7 w-7 text-orange-400" />
          Research Insights Command Center
        </motion.h2>
        <motion.p 
          className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Unified view of all your research activities. Track performance, identify patterns, and discover high-impact opportunities across all your research sessions.
        </motion.p>
      </motion.div>

      {/* Enhanced Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Keywords</p>
                  <p className="text-3xl font-bold text-blue-400">127</p>
                </div>
                <Search className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+23% this week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Questions Found</p>
                  <p className="text-3xl font-bold text-purple-400">73</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+15% this week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 backdrop-blur-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Content Gaps</p>
                  <p className="text-3xl font-bold text-green-400">29</p>
                </div>
                <FileSearch className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+8% this week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30 backdrop-blur-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Opportunities</p>
                  <p className="text-3xl font-bold text-orange-400">41</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+31% this week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Opportunities */}
      <Card className="bg-black/20 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Top Opportunities This Week
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportReport} className="border-white/20 hover:bg-white/10 backdrop-blur-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {topOpportunities.map((opportunity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-background/40 rounded-lg border border-border/30"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-foreground">{opportunity.keyword}</h4>
                  <Badge variant="outline" className={`
                    ${opportunity.type === 'keyword' ? 'border-blue-500/30 text-blue-400' : ''}
                    ${opportunity.type === 'question' ? 'border-purple-500/30 text-purple-400' : ''}
                    ${opportunity.type === 'gap' ? 'border-green-500/30 text-green-400' : ''}
                  `}>
                    {opportunity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{opportunity.opportunity}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="text-foreground font-medium">{opportunity.searchVolume}</div>
                  <div className="text-muted-foreground">Volume</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${
                    opportunity.difficulty === 'Low' ? 'text-green-400' :
                    opportunity.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {opportunity.difficulty}
                  </div>
                  <div className="text-muted-foreground">Difficulty</div>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Research Sessions */}
      <Card className="bg-background/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Recent Research Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {researchSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-background/40 rounded-lg border border-border/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{session.keyword}</h4>
                  <p className="text-sm text-muted-foreground">{session.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-blue-400 font-medium">{session.questionsFound}</div>
                  <div className="text-muted-foreground">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-medium">{session.contentGaps}</div>
                  <div className="text-muted-foreground">Gaps</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 font-medium">{session.opportunities}</div>
                  <div className="text-muted-foreground">Opportunities</div>
                </div>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  {session.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Research Recommendations */}
      <Card className="bg-background/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Research Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-primary/10 to-blue-500/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Explore Long-tail Variations</h4>
                <p className="text-sm text-muted-foreground">
                  Based on your research, consider investigating long-tail variations of "content marketing" such as "content marketing for SaaS" or "content marketing automation tools".
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-lg border border-green-500/20">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Address Question Clusters</h4>
                <p className="text-sm text-muted-foreground">
                  You've identified strong question clusters around "how to" topics. Consider creating comprehensive guides that address multiple related questions in one piece.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-lg border border-purple-500/20">
            <div className="flex items-start gap-3">
              <FileSearch className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Content Gap Priority</h4>
                <p className="text-sm text-muted-foreground">
                  Focus on the 5 content gaps with highest search volume and lowest competition. These represent your best short-term ranking opportunities.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};