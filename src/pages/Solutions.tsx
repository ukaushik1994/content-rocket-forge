
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { SolutionCard } from '@/components/solutions/SolutionCard';
import { SolutionUploader } from '@/components/solutions/SolutionUploader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

const Solutions = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Business Solutions</h1>
            <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
              <Plus className="mr-2 h-4 w-4" />
              Add New Solution
            </Button>
          </div>
          
          <Tabs defaultValue="solutions">
            <TabsList className="bg-secondary/30">
              <TabsTrigger value="solutions">All Solutions</TabsTrigger>
              <TabsTrigger value="add">Add Solutions</TabsTrigger>
              <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="solutions" className="mt-6 space-y-6">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search solutions..."
                    className="pl-9 bg-glass border-white/10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SolutionCard 
                  name="TaskMaster Pro"
                  features={["Gantt charts", "Team collaboration", "AI analytics"]}
                  useCases={["Remote teams", "Agile workflows"]}
                  painPoints={["Missed deadlines", "Poor task visibility"]}
                  targetAudience={["Project managers", "IT teams"]}
                  cta="Use in Content"
                />
                
                <SolutionCard 
                  name="EmailPro Marketing"
                  features={["Drip campaigns", "A/B testing", "Audience segmentation"]}
                  useCases={["Newsletter management", "Customer retention"]}
                  painPoints={["Low open rates", "Poor deliverability"]}
                  targetAudience={["Marketers", "Small businesses"]}
                  cta="Use in Content"
                />
                
                <SolutionCard 
                  name="SalesForce CRM+"
                  features={["Pipeline management", "Lead scoring", "Analytics dashboard"]}
                  useCases={["Sales teams", "Account management"]}
                  painPoints={["Lost leads", "Disorganized contacts"]}
                  targetAudience={["Sales representatives", "Account managers"]}
                  cta="Use in Content"
                />
                
                <SolutionCard 
                  name="SecurityGuard Pro"
                  features={["Threat detection", "Real-time monitoring", "Compliance reports"]}
                  useCases={["Data protection", "Compliance management"]}
                  painPoints={["Security breaches", "Compliance violations"]}
                  targetAudience={["IT security teams", "Compliance officers"]}
                  cta="Use in Content"
                />
                
                <SolutionCard 
                  name="AnalyticsHub"
                  features={["Custom dashboards", "Predictive analytics", "Data visualization"]}
                  useCases={["Business intelligence", "Market research"]}
                  painPoints={["Data silos", "Slow reporting"]}
                  targetAudience={["Data analysts", "Business stakeholders"]}
                  cta="Use in Content"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="add" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <SolutionUploader />
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center">
                  <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-medium">Solution Analytics Coming Soon</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Track how your business solutions are performing in generated content, including mentions, click-throughs, and conversion metrics.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Solutions;
