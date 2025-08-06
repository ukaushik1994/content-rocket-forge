import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Zap, BarChart3 } from 'lucide-react';
import { AIServiceToggle } from './AIServiceToggle';
import { ProviderManagement } from './ProviderManagement';
import { MigrationNotification } from './MigrationNotification';

export function EnhancedAISettings() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleManageProviders = () => {
    setActiveTab('providers');
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent">
              AI Service Hub
            </h1>
            <p className="text-muted-foreground">
              Manage your AI providers and service configuration
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Service Control
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Provider Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Usage Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MigrationNotification />
          <AIServiceToggle onManageProviders={handleManageProviders} />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleManageProviders}>
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Manage Providers</h3>
                      <p className="text-sm text-muted-foreground">Add, test, and configure AI providers</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('analytics')}>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">View Analytics</h3>
                      <p className="text-sm text-muted-foreground">Monitor usage and performance</p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <ProviderManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Analytics Coming Soon</p>
                <p className="text-sm">
                  Track your AI service usage, costs, and performance metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}