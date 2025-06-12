
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, TrendingUp, Zap, Award, Users, Calendar, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'posting' | 'engagement' | 'streak' | 'milestone' | 'special';
  points: number;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  levelName: string;
  nextLevelName: string;
}

export const GamificationSystem = () => {
  const levelInfo: LevelInfo = {
    currentLevel: 5,
    currentXP: 156,
    nextLevelXP: 200,
    totalXP: 856,
    levelName: "Social Star",
    nextLevelName: "Brand Champion"
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Share your first post',
      icon: Star,
      category: 'posting',
      points: 10,
      progress: 1,
      target: 1,
      unlocked: true,
      unlockedAt: '2 days ago',
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Consistent Creator',
      description: 'Share posts for 7 days in a row',
      icon: Flame,
      category: 'streak',
      points: 50,
      progress: 5,
      target: 7,
      unlocked: false,
      rarity: 'rare'
    },
    {
      id: '3',
      name: 'Engagement Master',
      description: 'Get 100 total likes across all posts',
      icon: TrendingUp,
      category: 'engagement',
      points: 75,
      progress: 67,
      target: 100,
      unlocked: false,
      rarity: 'epic'
    },
    {
      id: '4',
      name: 'Team Player',
      description: 'Help 3 colleagues with content ideas',
      icon: Users,
      category: 'special',
      points: 40,
      progress: 1,
      target: 3,
      unlocked: false,
      rarity: 'rare'
    },
    {
      id: '5',
      name: 'Social Influencer',
      description: 'Reach 1000 people with your posts',
      icon: Trophy,
      category: 'milestone',
      points: 100,
      progress: 2400,
      target: 1000,
      unlocked: true,
      unlockedAt: '1 week ago',
      rarity: 'legendary'
    },
    {
      id: '6',
      name: 'Content Calendar Pro',
      description: 'Schedule 10 posts in advance',
      icon: Calendar,
      category: 'posting',
      points: 30,
      progress: 3,
      target: 10,
      unlocked: false,
      rarity: 'common'
    }
  ];

  const weeklyChallenge = {
    name: "Product Launch Week",
    description: "Share content about our new AI features",
    progress: 3,
    target: 5,
    pointsPerAction: 15,
    bonusPoints: 50,
    timeLeft: "4 days left"
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400/20 bg-gray-400/10';
      case 'rare': return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
      case 'epic': return 'text-purple-400 border-purple-400/20 bg-purple-400/10';
      case 'legendary': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'posting': return Target;
      case 'engagement': return TrendingUp;
      case 'streak': return Flame;
      case 'milestone': return Trophy;
      case 'special': return Award;
    }
  };

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">Level {levelInfo.currentLevel}</div>
              <div className="text-purple-300">{levelInfo.levelName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Next: {levelInfo.nextLevelName}</div>
              <div className="text-sm text-white/60">{levelInfo.currentXP}/{levelInfo.nextLevelXP} XP</div>
            </div>
          </div>
          <div className="space-y-2">
            <Progress 
              value={(levelInfo.currentXP / levelInfo.nextLevelXP) * 100} 
              className="h-3 bg-white/10"
            />
            <div className="text-xs text-white/60 text-center">
              {levelInfo.nextLevelXP - levelInfo.currentXP} XP until next level
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenge */}
      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-orange-400" />
            Weekly Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-1">{weeklyChallenge.name}</h3>
            <p className="text-sm text-white/70">{weeklyChallenge.description}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Progress: {weeklyChallenge.progress}/{weeklyChallenge.target}</span>
            <Badge variant="outline" className="border-orange-400 text-orange-300">
              {weeklyChallenge.timeLeft}
            </Badge>
          </div>
          <Progress 
            value={(weeklyChallenge.progress / weeklyChallenge.target) * 100}
            className="h-2 bg-white/10"
          />
          <div className="text-xs text-white/60">
            +{weeklyChallenge.pointsPerAction} points per action • +{weeklyChallenge.bonusPoints} bonus for completion
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const CategoryIcon = getCategoryIcon(achievement.category);
              const isComplete = achievement.progress >= achievement.target;
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all ${
                    achievement.unlocked 
                      ? getRarityColor(achievement.rarity)
                      : 'bg-white/5 border-white/10'
                  } ${isComplete && !achievement.unlocked ? 'animate-pulse' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20' 
                        : 'bg-white/10'
                    }`}>
                      <achievement.icon className={`h-5 w-5 ${
                        achievement.unlocked ? 'text-yellow-400' : 'text-white/60'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${
                          achievement.unlocked ? 'text-white' : 'text-white/80'
                        }`}>
                          {achievement.name}
                        </h4>
                        <CategoryIcon className="h-3 w-3 text-white/50" />
                      </div>
                      <p className="text-xs text-white/60 mb-2">{achievement.description}</p>
                      
                      {!achievement.unlocked && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">
                              {achievement.progress}/{achievement.target}
                            </span>
                            <span className="text-green-400">+{achievement.points} pts</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.target) * 100}
                            className="h-1 bg-white/10"
                          />
                        </div>
                      )}
                      
                      {achievement.unlocked && (
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs bg-green-500/20 text-green-400">
                            Unlocked {achievement.unlockedAt}
                          </Badge>
                          <span className="text-xs text-green-400">+{achievement.points} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Points Breakdown */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Points Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-lg font-bold text-green-400">+15</div>
              <div className="text-xs text-white/70">Per Share</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-lg font-bold text-blue-400">+3</div>
              <div className="text-xs text-white/70">Per Like</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-lg font-bold text-purple-400">+5</div>
              <div className="text-xs text-white/70">Per Comment</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-lg font-bold text-yellow-400">+10</div>
              <div className="text-xs text-white/70">Customization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
