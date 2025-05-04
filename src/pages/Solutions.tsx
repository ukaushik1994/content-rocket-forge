import React, { useState, Suspense, lazy } from 'react';
import Navbar from '@/components/layout/Navbar';
import { SolutionUploader } from '@/components/solutions/SolutionUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, UploadCloud, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ContentBuilderProvider } from '@/contexts/ContentBuilderContext';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { motion } from 'framer-motion';

// Lazy load the SolutionManager for better performance
const SolutionManager = lazy(() => import('@/components/solutions/manager').then(module => ({
  default: module.SolutionManager
})));

// Loading fallback component
const LoadingFallback = () => <div className="flex flex-col justify-center items-center py-12 space-y-4">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-4 border-neon-purple/30 border-t-neon-purple animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neon-purple animate-pulse" />
      </div>
    </div>
    <span className="text-lg font-medium text-gradient">Loading solutions...</span>
  </div>;

// Error fallback component
const ErrorFallback = ({
  error,
  resetErrorBoundary
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => <Card className="glass-panel">
    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-red-500/10 p-4 mb-4">
        <X className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        There was an error loading the solutions: {error.message}
      </p>
      <Button onClick={resetErrorBoundary} variant="destructive">
        Try again
      </Button>
    </CardContent>
  </Card>;
const Solutions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('solutions');
  const navigate = useNavigate();

  // Animation variants for the page transition
  const pageVariants = {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };
  const itemVariants = {
    initial: {
      y: 20,
      opacity: 0
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  return <motion.div className="min-h-screen flex flex-col bg-background" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Helmet>
        <title>Business Solutions | ContentRocketForge</title>
        <meta name="description" content="Manage your business solutions for content creation" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8 rounded-3xl">
        <motion.div variants={itemVariants} className="mb-8">
          <Tabs defaultValue="solutions" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-secondary/30 backdrop-blur-sm border border-white/5 p-1 w-full sm:w-auto">
              <TabsTrigger value="solutions" className="flex items-center gap-2 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white">
                <FileText className="h-4 w-4" />
                All Solutions
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center gap-2 data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white">
                <UploadCloud className="h-4 w-4" />
                Add Solutions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="solutions" className="mt-6">
              <ContentBuilderProvider>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Suspense fallback={<LoadingFallback />}>
                    <SolutionManager searchTerm={searchTerm} />
                  </Suspense>
                </ErrorBoundary>
              </ContentBuilderProvider>
            </TabsContent>
            
            <TabsContent value="add" className="mt-6">
              <motion.div className="max-w-2xl mx-auto" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }}>
                <SolutionUploader />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </motion.div>;
};
export default Solutions;