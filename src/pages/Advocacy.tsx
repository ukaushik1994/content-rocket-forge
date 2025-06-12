
import React, { useState } from 'react';
import { AdvocacyDashboard } from '@/components/advocacy/AdvocacyDashboard';
import { ContentTemplates } from '@/components/advocacy/ContentTemplates';
import { Leaderboard } from '@/components/advocacy/Leaderboard';
import { AdvocacyOnboarding } from '@/components/advocacy/AdvocacyOnboarding';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { Megaphone, Trophy, FileText, Target, TrendingUp, Users, Zap, Star } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <Megaphone className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">Employee Advocacy</h1>
                  <p className="text-lg text-muted-foreground">
                    Share our story, grow your voice, earn rewards
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowOnboarding(true)}
                className="hidden md:flex"
              >
                View Tutorial
              </Button>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">156</div>
                  <div className="text-sm text-muted-foreground">Your Points</div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    +12 today
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-muted-foreground">Posts Shared</div>
                  <Badge variant="outline" className="mt-1 text-xs border-green-200 text-green-700">
                    This month
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">2.4K</div>
                  <div className="text-sm text-muted-foreground">Total Reach</div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+15%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">#5</div>
                  <div className="text-sm text-muted-foreground">Leaderboard</div>
                  <Badge className="mt-1 text-xs bg-gradient-to-r from-purple-500 to-blue-500">
                    Top 10
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-background">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Content Hub</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Campaigns</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <AdvocacyDashboard />
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <ContentTemplates />
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Leaderboard />
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    No active campaigns right now. Check back soon for exciting new challenges!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Team campaigns launch every month</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Advocacy;
