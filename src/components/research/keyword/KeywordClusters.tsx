
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, Target, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface KeywordClustersProps {
  serpData: any;
  onSelectKeywords: (keywords: string[]) => void;
}

export const KeywordClusters: React.FC<KeywordClustersProps> = ({
  serpData,
  onSelectKeywords
}) => {
  const [selectedCluster, setSelectedCluster] = useState(null);

  // Generate keyword clusters based on SERP data
  const clusters = useMemo(() => {
    const allKeywords = [
      ...(serpData?.keywords || []),
      ...(serpData?.relatedSearches?.map(rs => rs.query) || []),
      ...(serpData?.peopleAlsoAsk?.map(q => q.question) || [])
    ];

    // Simple clustering based on common words
    const clusters = {
      informational: {
        name: 'Informational',
        description: 'How-to, what is, guide content',
        keywords: allKeywords.filter(k => 
          /\b(how|what|why|guide|tips|learn|understand)\b/i.test(k)
        ),
        intent: 'Informational',
        difficulty: 'Easy',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10'
      },
      commercial: {
        name: 'Commercial',
        description: 'Best, top, review, comparison',
        keywords: allKeywords.filter(k => 
          /\b(best|top|review|compare|vs|versus|alternative)\b/i.test(k)
        ),
        intent: 'Commercial',
        difficulty: 'Medium',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10'
      },
      transactional: {
        name: 'Transactional',
        description: 'Buy, price, cost, purchase',
        keywords: allKeywords.filter(k => 
          /\b(buy|price|cost|purchase|order|discount|deal)\b/i.test(k)
        ),
        intent: 'Transactional',
        difficulty: 'Hard',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10'
      },
      navigational: {
        name: 'Navigational',
        description: 'Brand names, specific sites',
        keywords: allKeywords.filter(k => 
          /\b(login|sign|account|dashboard|app|software)\b/i.test(k)
        ),
        intent: 'Navigational',
        difficulty: 'Medium',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10'
      }
    };

    // Filter out empty clusters
    return Object.entries(clusters)
      .filter(([_, cluster]) => cluster.keywords.length > 0)
      .reduce((acc, [key, cluster]) => ({ ...acc, [key]: cluster }), {});
  }, [serpData]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 border-green-400';
      case 'Medium': return 'text-yellow-400 border-yellow-400';
      case 'Hard': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const handleSelectCluster = (clusterKey: string) => {
    const cluster = clusters[clusterKey];
    onSelectKeywords(cluster.keywords);
    setSelectedCluster(clusterKey);
  };

  return (
    <div className="space-y-6">
      {/* Cluster Overview */}
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Keyword Clusters by Search Intent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(clusters).map(([key, cluster]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedCluster === key 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:border-white/20'
                  }`}
                  onClick={() => handleSelectCluster(key)}
                >
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 ${cluster.bgColor} rounded-full flex items-center justify-center mb-3`}>
                      <Target className={`h-6 w-6 ${cluster.color}`} />
                    </div>
                    <h3 className="font-semibold mb-1">{cluster.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {cluster.description}
                    </p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {cluster.keywords.length} keywords
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(cluster.difficulty)}`}
                      >
                        {cluster.difficulty}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {cluster.intent} Intent
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Cluster Details */}
      {selectedCluster && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className={clusters[selectedCluster].color} />
                  {clusters[selectedCluster].name} Cluster
                </span>
                <Button
                  onClick={() => onSelectKeywords(clusters[selectedCluster].keywords)}
                  className="bg-gradient-to-r from-primary to-blue-500"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Use All Keywords
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {clusters[selectedCluster].keywords.map((keyword, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <p className="font-medium text-sm">{keyword}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Content Strategy Recommendation</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedCluster === 'informational' && 
                    "Create comprehensive guides, tutorials, and educational content. Focus on answering common questions and providing step-by-step instructions."
                  }
                  {selectedCluster === 'commercial' && 
                    "Develop comparison content, reviews, and buyer's guides. Highlight features, benefits, and help users make informed decisions."
                  }
                  {selectedCluster === 'transactional' && 
                    "Build conversion-focused landing pages with clear CTAs, pricing information, and purchase incentives."
                  }
                  {selectedCluster === 'navigational' && 
                    "Create brand-specific content, product pages, and resources that help users find what they're looking for."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {Object.keys(clusters).length === 0 && (
        <Card className="glass-panel border-white/10">
          <CardContent className="p-8 text-center">
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Keyword Clusters Found</h3>
            <p className="text-muted-foreground">
              Try searching for a different keyword to see cluster analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
