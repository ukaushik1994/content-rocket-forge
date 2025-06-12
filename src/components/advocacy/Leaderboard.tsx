
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const Leaderboard = () => {
  const leaderboardData = [
    {
      rank: 1,
      name: "Sarah Chen",
      department: "Product",
      points: 2840,
      shares: 47,
      engagement: "94%",
      badge: "Brand Champion",
      avatar: "SC"
    },
    {
      rank: 2,
      name: "Alex Rodriguez",
      department: "Engineering",
      points: 2650,
      shares: 43,
      engagement: "91%",
      badge: "Social Star",
      avatar: "AR"
    },
    {
      rank: 3,
      name: "Maya Patel",
      department: "Marketing",
      points: 2420,
      shares: 39,
      engagement: "89%",
      badge: "Content Creator",
      avatar: "MP"
    },
    {
      rank: 4,
      name: "Jordan Kim",
      department: "Sales",
      points: 2180,
      shares: 35,
      engagement: "87%",
      badge: "Rising Star",
      avatar: "JK"
    },
    {
      rank: 5,
      name: "You",
      department: "Design",
      points: 1560,
      shares: 28,
      engagement: "85%",
      badge: "Team Player",
      avatar: "YU",
      isCurrentUser: true
    },
    {
      rank: 6,
      name: "Emma Wilson",
      department: "HR",
      points: 1420,
      shares: 24,
      engagement: "82%",
      badge: "Supporter",
      avatar: "EW"
    }
  ];

  const monthlyStats = {
    totalAdvocates: 156,
    totalShares: 892,
    totalReach: "45.2K",
    avgEngagement: "87%"
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-white/60 font-bold">#{rank}</div>;
    }
  };

  const getBadgeColor = (badge) => {
    const colors = {
      "Brand Champion": "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "Social Star": "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "Content Creator": "bg-green-500/20 text-green-300 border-green-500/30",
      "Rising Star": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      "Team Player": "bg-orange-500/20 text-orange-300 border-orange-500/30",
      "Supporter": "bg-gray-500/20 text-gray-300 border-gray-500/30"
    };
    return colors[badge] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-neon-purple mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{monthlyStats.totalAdvocates}</div>
            <div className="text-sm text-white/70">Active Advocates</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{monthlyStats.totalShares}</div>
            <div className="text-sm text-white/70">Total Shares</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{monthlyStats.totalReach}</div>
            <div className="text-sm text-white/70">Total Reach</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{monthlyStats.avgEngagement}</div>
            <div className="text-sm text-white/70">Avg Engagement</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            This Month's Champions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboardData.map((user, index) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  user.isCurrentUser 
                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${user.isCurrentUser ? 'text-white' : 'text-white/90'}`}>
                      {user.name}
                    </h3>
                    {user.isCurrentUser && (
                      <Badge className="bg-neon-purple/20 text-neon-purple">You</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-white/60">{user.department}</span>
                    <Badge variant="outline" className={`text-xs ${getBadgeColor(user.badge)}`}>
                      {user.badge}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{user.points.toLocaleString()}</div>
                  <div className="text-xs text-white/60">{user.shares} shares • {user.engagement} engagement</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Levels */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Achievement Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-semibold text-yellow-300">Brand Champion</h4>
              <p className="text-xs text-white/70 mt-1">2000+ points</p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Star className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-300">Social Star</h4>
              <p className="text-xs text-white/70 mt-1">1000+ points</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <Award className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-green-300">Team Player</h4>
              <p className="text-xs text-white/70 mt-1">500+ points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
