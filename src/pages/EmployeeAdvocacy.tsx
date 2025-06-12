
import React, { useState } from 'react';
import { AdvocacyDashboard } from '@/components/advocacy/AdvocacyDashboard';
import { ContentTemplates } from '@/components/advocacy/ContentTemplates';
import { AnalyticsInsights } from '@/components/advocacy/AnalyticsInsights';
import { AdvocacyOnboarding } from '@/components/advocacy/AdvocacyOnboarding';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Megaphone, FileText, Target, TrendingUp, Users, Star, BarChart, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const EmployeeAdvocacy = () => {
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('advocacy_onboarding_completed');
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('advocacy_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (showOnboarding) {
    return <AdvocacyOnboarding onComplete={handleOnboardingComplete} />;
  }

  const userFullName = userProfile?.first_name ? 
    `${userProfile.first_name} ${userProfile.last_name || ''}`.trim() : 
    'Employee';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple Employee Header */}
      <header className="bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <Megaphone className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Star className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome, {userFullName}</h1>
                <p className="text-sm text-muted-foreground">Employee Advocacy Portal</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Advocacy Dashboard</h2>
              <p className="text-lg text-muted-foreground">
                Share our story, grow your voice, earn rewards
              </p>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
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
                  <div className="text-sm text-muted-foreground">Team Rank</div>
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
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 max-w-md mx-auto">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-background">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">My Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <AdvocacyDashboard />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <ContentTemplates />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsInsights />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default EmployeeAdvocacy;
