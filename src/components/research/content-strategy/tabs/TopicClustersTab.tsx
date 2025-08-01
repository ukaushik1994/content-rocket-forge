
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Plus, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopicClustersTabProps {
  serpMetrics: any;
  goals: any;
}

export const TopicClustersTab = ({ serpMetrics, goals }: TopicClustersTabProps) => {
  const getTopicClusters = () => {
    const mainKeyword = goals.mainKeyword || 'Content Marketing';
    const baseVolume = serpMetrics?.searchVolume || 10000;
    
    return [
      {
        id: 1,
        mainTopic: mainKeyword,
        pillarPage: `Complete Guide to ${mainKeyword}`,
        subTopics: [
          { 
            title: `${mainKeyword} Strategy`, 
            searchVolume: Math.floor(baseVolume * 0.4).toLocaleString(), 
            difficulty: serpMetrics?.keywordDifficulty < 50 ? "Easy" : "Medium" 
          },
          { 
            title: `${mainKeyword} Tools`, 
            searchVolume: Math.floor(baseVolume * 0.3).toLocaleString(), 
            difficulty: "Low" 
          },
          { 
            title: `${mainKeyword} Examples`, 
            searchVolume: Math.floor(baseVolume * 0.25).toLocaleString(), 
            difficulty: "Easy" 
          },
          { 
            title: `${mainKeyword} Tips`, 
            searchVolume: Math.floor(baseVolume * 0.2).toLocaleString(), 
            difficulty: "Low" 
          }
        ],
        status: "Planning"
      },
      {
        id: 2,
        mainTopic: `Advanced ${mainKeyword}`,
        pillarPage: `Advanced ${mainKeyword} Techniques`,
        subTopics: [
          { 
            title: `${mainKeyword} Analytics`, 
            searchVolume: Math.floor(baseVolume * 0.15).toLocaleString(), 
            difficulty: "High" 
          },
          { 
            title: `${mainKeyword} Automation`, 
            searchVolume: Math.floor(baseVolume * 0.12).toLocaleString(), 
            difficulty: "Medium" 
          },
          { 
            title: `${mainKeyword} ROI`, 
            searchVolume: Math.floor(baseVolume * 0.1).toLocaleString(), 
            difficulty: "Medium" 
          },
          { 
            title: `${mainKeyword} Metrics`, 
            searchVolume: Math.floor(baseVolume * 0.08).toLocaleString(), 
            difficulty: "High" 
          }
        ],
        status: "In Progress"
      },
      {
        id: 3,
        mainTopic: `${mainKeyword} for Beginners`,
        pillarPage: `${mainKeyword} Beginner's Guide`,
        subTopics: [
          { 
            title: `What is ${mainKeyword}`, 
            searchVolume: Math.floor(baseVolume * 0.6).toLocaleString(), 
            difficulty: "Easy" 
          },
          { 
            title: `How to Start ${mainKeyword}`, 
            searchVolume: Math.floor(baseVolume * 0.5).toLocaleString(), 
            difficulty: "Easy" 
          },
          { 
            title: `${mainKeyword} Basics`, 
            searchVolume: Math.floor(baseVolume * 0.35).toLocaleString(), 
            difficulty: "Low" 
          },
          { 
            title: `${mainKeyword} Course`, 
            searchVolume: Math.floor(baseVolume * 0.25).toLocaleString(), 
            difficulty: "Medium" 
          }
        ],
        status: "Completed"
      }
    ];
  };

  const topicClusters = getTopicClusters();

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'text-green-400 bg-green-500/20';
    if (status === 'In Progress') return 'text-yellow-400 bg-yellow-500/20';
    return 'text-blue-400 bg-blue-500/20';
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Easy' || difficulty === 'Low') return 'default';
    if (difficulty === 'Medium') return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <BarChart3 className="h-6 w-6 text-purple-400" />
          </div>
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Topic Cluster Strategy
          </span>
          <Badge variant="outline" className="text-purple-400 border-purple-400 ml-auto">
            {serpMetrics ? 'SERP-Enhanced' : 'AI-Generated'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topicClusters.map((cluster, index) => (
            <motion.div
              key={cluster.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="p-6 bg-glass rounded-xl border border-white/10 hover:border-purple-400/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-white text-xl mb-1">{cluster.mainTopic}</h4>
                  <p className="text-muted-foreground mb-2">Pillar Page: {cluster.pillarPage}</p>
                  <Badge variant="outline" className={getStatusColor(cluster.status)}>
                    {cluster.status}
                  </Badge>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Topic
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cluster.subTopics.map((subTopic, idx) => (
                  <div key={idx} className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-white">{subTopic.title}</h5>
                      <Badge variant={getDifficultyColor(subTopic.difficulty)} className="text-xs">
                        {subTopic.difficulty}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Search Volume: <span className="text-purple-400 font-medium">{subTopic.searchVolume}/mo</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="hover:bg-purple-500/10">
                  View Cluster Map
                </Button>
                <Button size="sm" variant="outline" className="hover:bg-blue-500/10">
                  Generate Content Plan
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-white/10">
          <h5 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-400" />
            Topic Cluster Best Practices
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
            <div>
              <span className="font-medium text-purple-400">Pillar Content:</span>
              <p>Create comprehensive guides that cover the main topic broadly</p>
            </div>
            <div>
              <span className="font-medium text-blue-400">Cluster Content:</span>
              <p>Develop specific content that dives deep into subtopics</p>
            </div>
            <div>
              <span className="font-medium text-green-400">Internal Linking:</span>
              <p>Connect all cluster content to the pillar page strategically</p>
            </div>
            <div>
              <span className="font-medium text-purple-400">User Intent:</span>
              <p>Match content type to search intent for each cluster topic</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
