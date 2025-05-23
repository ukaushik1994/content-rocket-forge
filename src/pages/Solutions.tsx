import React, { Suspense, lazy, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContentBuilderProvider } from '@/contexts/ContentBuilderContext';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { motion } from 'framer-motion';
import { CompanyInfo, BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { CompanySection } from '@/components/solutions/company';
import { BrandGuidelinesDisplay } from '@/components/solutions/brand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

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
  const navigate = useNavigate();

  // Store company information and brand guidelines
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [brandGuidelines, setBrandGuidelines] = useState<BrandGuidelines | null>(null);

  // Load stored company and brand information from localStorage on mount
  useEffect(() => {
    const storedCompanyInfo = localStorage.getItem('companyInfo');
    if (storedCompanyInfo) {
      try {
        setCompanyInfo(JSON.parse(storedCompanyInfo));
      } catch (e) {
        console.error('Error parsing company info:', e);
      }
    }
    
    const storedBrandGuidelines = localStorage.getItem('brandGuidelines');
    if (storedBrandGuidelines) {
      try {
        setBrandGuidelines(JSON.parse(storedBrandGuidelines));
      } catch (e) {
        console.error('Error parsing brand guidelines:', e);
      }
    }
  }, []);

  // Handle saving company information
  const handleSaveCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
    localStorage.setItem('companyInfo', JSON.stringify(info));
  };

  // Handle saving brand guidelines
  const handleSaveBrandGuidelines = (guidelines: BrandGuidelines) => {
    setBrandGuidelines(guidelines);
    localStorage.setItem('brandGuidelines', JSON.stringify(guidelines));
  };

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
        <motion.div variants={itemVariants} className="mb-8 space-y-12">
          {/* Company Section - Moved to top */}
          <CompanySection 
            companyInfo={companyInfo}
            onSave={handleSaveCompanyInfo}
          />
          
          {/* Solutions Manager */}
          <ContentBuilderProvider>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<LoadingFallback />}>
                <SolutionManager searchTerm={searchTerm} />
              </Suspense>
            </ErrorBoundary>
          </ContentBuilderProvider>
          
          {/* Brand Guidelines Display */}
          <BrandGuidelinesDisplay
            guidelines={brandGuidelines}
            companyId={companyInfo?.id || ''}
            onSave={handleSaveBrandGuidelines}
          />
        </motion.div>
      </main>
    </motion.div>;
};

export default Solutions;
