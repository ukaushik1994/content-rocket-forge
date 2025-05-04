
import React, { useState, Suspense, lazy } from 'react';
import Navbar from '@/components/layout/Navbar';
import { SolutionUploader } from '@/components/solutions/SolutionUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, SlidersHorizontal, BarChart3, FileText, UploadCloud, PenSquare, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContentBuilderProvider } from '@/contexts/ContentBuilderContext';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/solutions/HeroSection';

// Lazy load the SolutionManager for better performance
const SolutionManager = lazy(() => import('@/components/solutions/manager/SolutionManager').then(
  module => ({ default: module.SolutionManager })
));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2 text-lg">Loading solutions...</span>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <Card className="glass-panel">
    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-red-500/10 p-4 mb-4">
        <X className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        There was an error loading the solutions: {error.message}
      </p>
      <Button
        onClick={resetErrorBoundary}
        variant="destructive"
      >
        Try again
      </Button>
    </CardContent>
  </Card>
);

const Solutions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('solutions');
  const navigate = useNavigate();
  
  // Animation variants for the page transition
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Helmet>
        <title>Business Solutions | ContentRocketForge</title>
        <meta name="description" content="Manage your business solutions for content creation" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8 space-y-6">
        <Tabs 
          defaultValue="solutions" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
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
            <ContentBuilderProvider>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<LoadingFallback />}>
                  <SolutionManager searchTerm={searchTerm} />
                </Suspense>
              </ErrorBoundary>
            </ContentBuilderProvider>
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
      </main>
    </motion.div>
  );
};

export default Solutions;
