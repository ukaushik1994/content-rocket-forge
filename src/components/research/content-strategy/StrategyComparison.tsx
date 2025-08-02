import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, X, BarChart3, Target, TrendingUp, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StrategyComparisonProps {
  strategies: any[];
  onClose: () => void;
  onSelectStrategy: (strategy: any) => void;
}

export const StrategyComparison = ({ strategies, onClose, onSelectStrategy }: StrategyComparisonProps) => {
  const [selectedStrategies, setSelectedStrategies] = useState<any[]>(strategies.slice(0, 3));

  const toggleStrategy = (strategy: any) => {
    if (selectedStrategies.find(s => s.id === strategy.id)) {
      setSelectedStrategies(selectedStrategies.filter(s => s.id !== strategy.id));
    } else if (selectedStrategies.length < 3) {
      setSelectedStrategies([...selectedStrategies, strategy]);
    }
  };

  const getComparisonScore = (strategy: any) => {
    const difficultyScore = strategy.difficulty === 'Low' ? 30 : strategy.difficulty === 'Medium' ? 20 : 10;
    const timeScore = strategy.timeframe.includes('2') ? 30 : strategy.timeframe.includes('3') ? 25 : 15;
    const contentScore = Math.min(strategy.contentPieces / 2, 20);
    
    return difficultyScore + timeScore + contentScore + (strategy.score * 0.3);
  };

  const getBestStrategy = () => {
    return selectedStrategies.reduce((best, current) => 
      getComparisonScore(current) > getComparisonScore(best) ? current : best
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-y-auto glass-panel border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Strategy Comparison Tool
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white/60 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-muted-foreground">Compare up to 3 strategies side-by-side to make the best decision</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strategy Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Available Strategies</h3>
            <div className="flex flex-wrap gap-2">
              {strategies.map((strategy) => (
                <Button
                  key={strategy.id}
                  variant={selectedStrategies.find(s => s.id === strategy.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleStrategy(strategy)}
                  disabled={!selectedStrategies.find(s => s.id === strategy.id) && selectedStrategies.length >= 3}
                  className="text-sm"
                >
                  {selectedStrategies.find(s => s.id === strategy.id) && <CheckCircle className="h-4 w-4 mr-1" />}
                  {strategy.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Comparison Grid */}
          {selectedStrategies.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {selectedStrategies.map((strategy, index) => {
                const isRecommended = strategy.id === getBestStrategy().id;
                return (
                  <Card 
                    key={strategy.id} 
                    className={`relative glass-panel border-white/10 ${
                      isRecommended ? 'border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-3 py-1">
                          ⭐ Recommended
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6 space-y-4">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-white mb-2">{strategy.title}</h4>
                        <Badge variant="outline" className="text-primary border-primary">
                          Score: {Math.round(strategy.score)}
                        </Badge>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <TrendingUp className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                          <div className="text-lg font-bold text-blue-400">{strategy.traffic}</div>
                          <div className="text-xs text-muted-foreground">Traffic</div>
                        </div>
                        <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <Target className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                          <div className="text-lg font-bold text-purple-400">{strategy.contentPieces}</div>
                          <div className="text-xs text-muted-foreground">Content</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                          <Users className="h-5 w-5 text-white mx-auto mb-1" />
                          <Badge variant={strategy.difficulty === 'Low' ? 'default' : strategy.difficulty === 'Medium' ? 'secondary' : 'destructive'} className="text-xs">
                            {strategy.difficulty}
                          </Badge>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                          <Calendar className="h-5 w-5 text-white mx-auto mb-1" />
                          <div className="text-sm font-semibold text-white">{strategy.timeframe}</div>
                        </div>
                      </div>

                      {/* Topics */}
                      <div>
                        <h5 className="text-sm font-medium text-white mb-2">Content Topics</h5>
                        <div className="flex flex-wrap gap-1">
                          {strategy.topics.slice(0, 3).map((topic: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {strategy.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{strategy.topics.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Implementation Steps */}
                      <div>
                        <h5 className="text-sm font-medium text-white mb-2">Key Steps</h5>
                        <div className="space-y-1">
                          {strategy.implementation.slice(0, 2).map((step: string, idx: number) => (
                            <div key={idx} className="text-xs text-white/70 flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{step}</span>
                            </div>
                          ))}
                          {strategy.implementation.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{strategy.implementation.length - 2} more steps
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Overall Score */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">Overall Score</span>
                          <span className="text-primary">{Math.round(getComparisonScore(strategy))}/100</span>
                        </div>
                        <Progress value={getComparisonScore(strategy)} className="h-2" />
                      </div>

                      {/* Select Button */}
                      <Button 
                        className="w-full" 
                        variant={isRecommended ? "default" : "outline"}
                        onClick={() => onSelectStrategy(strategy)}
                      >
                        Select This Strategy
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Comparison Summary */}
          {selectedStrategies.length > 1 && (
            <Card className="glass-panel border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Comparison Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-lg font-bold text-green-400 mb-1">
                      {getBestStrategy().title}
                    </div>
                    <div className="text-sm text-muted-foreground">Best Overall Choice</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-lg font-bold text-blue-400 mb-1">
                      {Math.max(...selectedStrategies.map(s => parseInt(s.traffic.replace(/,/g, '')))).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Highest Traffic Potential</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-lg font-bold text-purple-400 mb-1">
                      {selectedStrategies.find(s => s.difficulty === 'Low')?.title?.split(' ')[0] || 'None'}
                    </div>
                    <div className="text-sm text-muted-foreground">Easiest to Implement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};