
import React, { useState } from 'react';
import { AdvocacyDashboard } from '@/components/advocacy/AdvocacyDashboard';
import { ContentTemplates } from '@/components/advocacy/ContentTemplates';
import { Leaderboard } from '@/components/advocacy/Leaderboard';
import { AnalyticsInsights } from '@/components/advocacy/AnalyticsInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { 
  Megaphone, 
  Trophy, 
  FileText, 
  Target, 
  TrendingUp, 
  Users, 
  Zap, 
  Star, 
  BarChart,
  Settings,
  UserCog,
  Shield
} from 'lucide-react';

const AdminAdvocacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Admin Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <UserCog className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">Advocacy Management</h1>
                  <p className="text-lg text-muted-foreground">
                    Monitor, manage, and optimize employee advocacy
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="hidden md:flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Manage Settings
              </Button>
            </div>
            
            {/* Admin Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">45</div>
                  <div className="text-sm text-muted-foreground">Active Advocates</div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    +3 this week
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">248</div>
                  <div className="text-sm text-muted-foreground">Total Posts</div>
                  <Badge variant="outline" className="mt-1 text-xs border-green-200 text-green-700">
                    This month
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">124K</div>
                  <div className="text-sm text-muted-foreground">Total Reach</div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+25%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">8.7%</div>
                  <div className="text-sm text-muted-foreground">Avg Engagement</div>
                  <Badge className="mt-1 text-xs bg-gradient-to-r from-purple-500 to-blue-500">
                    Industry +2.1%
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 h-12 bg-muted/50">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-background">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Campaigns</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AdvocacyDashboard />
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Content Template Management</h2>
                  <Button className="bg-gradient-to-r from-primary to-primary/80">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">
                  Manage and create content templates for your advocacy team
                </p>
              </div>
              <ContentTemplates />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">Advanced Analytics</h2>
                <p className="text-muted-foreground mt-2">
                  Comprehensive insights into advocacy performance and ROI
                </p>
              </div>
              <AnalyticsInsights />
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">Advocacy Leaderboard</h2>
                <p className="text-muted-foreground mt-2">
                  Track top performers and engagement across the organization
                </p>
              </div>
              <Leaderboard />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">User Management</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Manage advocacy users, roles, and permissions across your organization.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <UserCog className="h-4 w-4" />
                    <span>Advanced user management coming soon</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Campaign Management</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Create and manage advocacy campaigns to drive engagement and reach.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Campaign management tools coming soon</span>
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500">
                    <Zap className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminAdvocacy;
