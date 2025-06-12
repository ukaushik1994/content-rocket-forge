
import React, { useState } from 'react';
import { AdvocacyDashboard } from '@/components/advocacy/AdvocacyDashboard';
import { ContentTemplates } from '@/components/advocacy/ContentTemplates';
import { Leaderboard } from '@/components/advocacy/Leaderboard';
import { AdvocacyOnboarding } from '@/components/advocacy/AdvocacyOnboarding';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Trophy, FileText, Target } from 'lucide-react';

const Advocacy = () => {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('advocacy_onboarding_completed');
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('advocacy_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <AdvocacyOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full">
              <Megaphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Employee Advocacy</h1>
              <p className="text-white/70">Share our story, grow your voice, earn rewards 🚀</p>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">156</div>
              <div className="text-sm text-white/70">Your Points</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-400">12</div>
              <div className="text-sm text-white/70">Posts Shared</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-400">2.4K</div>
              <div className="text-sm text-white/70">Total Reach</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-purple-400">#5</div>
              <div className="text-sm text-white/70">Leaderboard Rank</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content Hub
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdvocacyDashboard />
          </TabsContent>

          <TabsContent value="templates">
            <ContentTemplates />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Active Campaigns</h3>
              <p className="text-white/70">No active campaigns right now. Check back soon! 🎯</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Advocacy;
