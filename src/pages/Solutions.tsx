
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { SolutionUploader } from '@/components/solutions/SolutionUploader';
import { SolutionManager } from '@/components/solutions/manager/SolutionManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, SlidersHorizontal, BarChart3, FileText, UploadCloud, PenSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContentBuilderProvider } from '@/contexts/ContentBuilderContext';

const Solutions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const handleCreateContent = () => {
    navigate('/content');
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  return <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Business Solutions</h1>
            
            <Button 
              onClick={handleCreateContent}
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Create Content with Solutions
            </Button>
          </div>
          
          <Tabs defaultValue="solutions">
            <TabsList className="bg-secondary/30">
              <TabsTrigger value="solutions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All Solutions
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                Add Solutions
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Usage Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="solutions" className="mt-6 space-y-6">
              <Card className="glass-panel">
                <CardContent className="pt-6 bg-gray-950">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search solutions by name, features, use cases or audience..." 
                        className="pl-9 bg-glass border-white/10" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button 
                          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={handleClearSearch}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Clear search</span>
                        </button>
                      )}
                    </div>
                    <Button variant="outline" size="icon" className="flex-shrink-0">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <ContentBuilderProvider>
                    <SolutionManager searchTerm={searchTerm} />
                  </ContentBuilderProvider>
                </CardContent>
              </Card>
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
    </div>;
};
export default Solutions;
