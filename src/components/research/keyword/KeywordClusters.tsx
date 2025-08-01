
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface KeywordClustersProps {
  serpData: any;
  onSelectKeywords: (keywords: string[]) => void;
}

interface KeywordCluster {
  name: string;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  keywords: string[];
  difficulty: number;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<any>;
}

export const KeywordClusters: React.FC<KeywordClustersProps> = ({
  serpData,
  onSelectKeywords
}) => {
  // Generate keyword clusters from SERP data
  const generateClusters = (): KeywordCluster[] => {
    const allKeywords = [
      ...(serpData?.keywords || []),
      ...(serpData?.relatedSearches?.map((rs: any) => rs.query) || []),
      ...(serpData?.peopleAlsoAsk?.map((paa: any) => paa.question) || [])
    ];

    const informationalKeywords = allKeywords.filter((keyword: string) => 
      keyword.toLowerCase().includes('what') || 
      keyword.toLowerCase().includes('how') || 
      keyword.toLowerCase().includes('why') ||
      keyword.toLowerCase().includes('guide') ||
      keyword.toLowerCase().includes('tutorial')
    );

    const commercialKeywords = allKeywords.filter((keyword: string) => 
      keyword.toLowerCase().includes('best') || 
      keyword.toLowerCase().includes('review') || 
      keyword.toLowerCase().includes('comparison') ||
      keyword.toLowerCase().includes('vs') ||
      keyword.toLowerCase().includes('alternative')
    );

    const transactionalKeywords = allKeywords.filter((keyword: string) => 
      keyword.toLowerCase().includes('buy') || 
      keyword.toLowerCase().includes('price') || 
      keyword.toLowerCase().includes('cost') ||
      keyword.toLowerCase().includes('discount') ||
      keyword.toLowerCase().includes('deal')
    );

    const navigationalKeywords = allKeywords.filter((keyword: string) => 
      keyword.toLowerCase().includes('login') || 
      keyword.toLowerCase().includes('website') || 
      keyword.toLowerCase().includes('official') ||
      keyword.toLowerCase().includes('app')
    );

    return [
      {
        name: 'Informational Intent',
        intent: 'informational' as const,
        keywords: informationalKeywords.slice(0, 8),
        difficulty: Math.floor(Math.random() * 30) + 20,
        description: 'Keywords focused on learning and understanding',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        icon: Lightbulb
      },
      {
        name: 'Commercial Intent',
        intent: 'commercial' as const,
        keywords: commercialKeywords.slice(0, 8),
        difficulty: Math.floor(Math.random() * 40) + 40,
        description: 'Keywords for research and comparison',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        icon: Target
      },
      {
        name: 'Transactional Intent',
        intent: 'transactional' as const,
        keywords: transactionalKeywords.slice(0, 8),
        difficulty: Math.floor(Math.random() * 30) + 60,
        description: 'Keywords with purchase intent',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        icon: TrendingUp
      },
      {
        name: 'Navigational Intent',
        intent: 'navigational' as const,
        keywords: navigationalKeywords.slice(0, 8),
        difficulty: Math.floor(Math.random() * 20) + 10,
        description: 'Brand and navigation focused keywords',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        icon: Brain
      }
    ].filter(cluster => cluster.keywords.length > 0);
  };

  const clusters = generateClusters();

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-400 border-green-400';
    if (difficulty < 60) return 'text-yellow-400 border-yellow-400';
    return 'text-red-400 border-red-400';
  };

  const handleSelectCluster = (cluster: KeywordCluster) => {
    onSelectKeywords(cluster.keywords);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-2">Keyword Intent Clusters</h2>
        <p className="text-muted-foreground">
          Keywords grouped by search intent from SERP analysis
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clusters.map((cluster, index) => (
          <motion.div
            key={cluster.intent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-panel border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className={`p-2 ${cluster.bgColor} rounded-lg`}>
                      <cluster.icon className={`h-5 w-5 ${cluster.color}`} />
                    </div>
                    {cluster.name}
                  </span>
                  <Badge variant="outline" className={getDifficultyColor(cluster.difficulty)}>
                    Difficulty: {cluster.difficulty}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {cluster.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {cluster.keywords.slice(0, 6).map((keyword, keywordIndex) => (
                    <Badge 
                      key={keywordIndex} 
                      variant="outline" 
                      className="text-xs bg-white/5"
                    >
                      {keyword}
                    </Badge>
                  ))}
                  {cluster.keywords.length > 6 && (
                    <Badge variant="outline" className="text-xs bg-white/5">
                      +{cluster.keywords.length - 6} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    {cluster.keywords.length} keywords
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleSelectCluster(cluster)}
                    className="bg-gradient-to-r from-primary/20 to-blue-500/20 hover:from-primary/30 hover:to-blue-500/30"
                  >
                    Select Cluster
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {clusters.length === 0 && (
        <Card className="glass-panel border-white/10">
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No keyword clusters found. Run a keyword analysis to see intent-based groupings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
