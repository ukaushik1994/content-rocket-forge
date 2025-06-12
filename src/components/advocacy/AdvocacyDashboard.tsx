
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Share2, Heart, MessageCircle, Zap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { GamificationSystem } from './GamificationSystem';
import { StreakTracker } from './StreakTracker';

export const AdvocacyDashboard = () => {
  const recentPosts = [
    {
      id: 1,
      content: "We're hiring! 🚀 The team is excited to grow – if you or someone you know is passionate about product design...",
      platform: "LinkedIn",
      engagement: { likes: 42, comments: 8, shares: 12 },
      points: 15,
      timeAgo: "2 hours ago"
    },
    {
      id: 2,
      content: "Big news: our AI feature just launched! 🎉 Proud of what we've built – helping teams collaborate faster than ever.",
      platform: "Twitter",
      engagement: { likes: 156, comments: 23, shares: 34 },
      points: 25,
      timeAgo: "1 day ago"
    }
  ];

  const suggestedContent = [
    {
      id: 1,
      type: "Product Launch",
      title: "New Dashboard Analytics Feature",
      description: "Share the exciting launch of our enhanced dashboard",
      urgency: "high",
      points: 20
    },
    {
      id: 2,
      type: "Culture",
      title: "Team Volunteer Day Recap",
      description: "Celebrate our recent community service initiative",
      urgency: "medium",
      points: 15
    },
    {
      id: 3,
      type: "Hiring",
      title: "Senior Developer Position",
      description: "Help us find our next amazing developer",
      urgency: "low",
      points: 10
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Impact This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">2.4K</div>
                <div className="text-sm text-white/70">Total Reach</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">89%</div>
                <div className="text-sm text-white/70">Engagement Rate</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between text-sm text-white/70 mb-1">
                <span>Progress to next level</span>
                <span>156/200 points</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-neon-purple to-neon-blue h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Tracker */}
        <StreakTracker />

        {/* Quick Actions */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-gradient-to-r from-neon-purple to-neon-blue">
              Share Now
            </Button>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              Browse Templates
            </Button>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              Schedule Post
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Gamification System */}
      <GamificationSystem />

      {/* Suggested Content */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ready to Share
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestedContent.map((content) => (
              <div key={content.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={content.urgency === 'high' ? 'default' : 'secondary'} className="text-xs">
                      {content.type}
                    </Badge>
                    {content.urgency === 'high' && (
                      <Badge variant="destructive" className="text-xs">🔥 Trending</Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-white">{content.title}</h4>
                  <p className="text-sm text-white/70">{content.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-400 mb-2">+{content.points} points</div>
                  <Button size="sm" className="bg-gradient-to-r from-neon-purple to-neon-blue">
                    Share Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Recent Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">{post.platform}</Badge>
                  <span className="text-xs text-white/60">{post.timeAgo}</span>
                </div>
                <p className="text-white mb-3">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.engagement.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.engagement.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {post.engagement.shares}
                    </span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    +{post.points} points
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
