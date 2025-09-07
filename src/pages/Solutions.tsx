import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContentBuilderProvider } from '@/contexts/ContentBuilderContext';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { motion } from 'framer-motion';
import { CompanyInfo, BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { CompetitorSection } from '@/components/company/CompetitorSection';
import { CompanySection } from '@/components/solutions/company';
import { BrandGuidelinesDisplay } from '@/components/solutions/brand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Import SolutionManager directly to avoid Router context issues with lazy loading
import { SolutionManager } from '@/components/solutions/manager';

// Helper function to safely convert Json to string array
const jsonToStringArray = (jsonValue: any): string[] => {
  if (Array.isArray(jsonValue)) {
    return jsonValue.map(item => String(item)).filter(item => item !== 'null' && item !== 'undefined');
  }
  return [];
};

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
  const { user } = useAuth();

  // Store company information and brand guidelines
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [brandGuidelines, setBrandGuidelines] = useState<BrandGuidelines | null>(null);
  const [loading, setLoading] = useState(true);

  // Load company and brand information from database on mount
  useEffect(() => {
    if (user) {
      loadCompanyData();
    }
  }, [user]);

  const loadCompanyData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load company info
      const { data: companyData, error: companyError } = await supabase
        .from('company_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyError) {
        console.error('Error loading company info:', companyError);
      } else if (companyData) {
        setCompanyInfo({
          id: companyData.id,
          name: companyData.name,
          description: companyData.description || '',
          industry: companyData.industry || '',
          founded: companyData.founded || '',
          size: companyData.size || '',
          mission: companyData.mission || '',
          values: jsonToStringArray(companyData.values),
          website: companyData.website,
          logoUrl: companyData.logo_url,
        });
      }

      // Load brand guidelines
      const { data: brandData, error: brandError } = await supabase
        .from('brand_guidelines')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (brandError) {
        console.error('Error loading brand guidelines:', brandError);
      } else if (brandData) {
        setBrandGuidelines({
          id: brandData.id,
          companyId: brandData.company_id || '',
          primaryColor: brandData.primary_color,
          secondaryColor: brandData.secondary_color,
          accentColor: brandData.accent_color,
          neutralColor: brandData.neutral_color,
          fontFamily: brandData.font_family,
          secondaryFontFamily: brandData.secondary_font_family,
          tone: jsonToStringArray(brandData.tone),
          keywords: jsonToStringArray(brandData.keywords),
          brandPersonality: brandData.brand_personality,
          missionStatement: brandData.mission_statement,
          doUse: jsonToStringArray(brandData.do_use),
          dontUse: jsonToStringArray(brandData.dont_use),
          logoUsageNotes: brandData.logo_usage_notes,
          imageryGuidelines: brandData.imagery_guidelines,
          targetAudience: brandData.target_audience,
          brandStory: brandData.brand_story,
          brandValues: brandData.brand_values,
          brandAssetsUrl: brandData.brand_assets_url,
        });
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      toast.error('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  // Handle saving company information
  const handleSaveCompanyInfo = async (info: CompanyInfo) => {
    if (!user) {
      toast.error('You must be logged in to save company information');
      return;
    }

    try {
      const companyData = {
        user_id: user.id,
        name: info.name,
        description: info.description,
        industry: info.industry,
        founded: info.founded,
        size: info.size,
        mission: info.mission,
        values: info.values,
        website: info.website,
        logo_url: info.logoUrl,
        updated_at: new Date().toISOString(),
      };

      let savedCompany;
      if (companyInfo?.id) {
        // Update existing company
        const { data, error } = await supabase
          .from('company_info')
          .update(companyData)
          .eq('id', companyInfo.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        savedCompany = data;
      } else {
        // Create new company
        const { data, error } = await supabase
          .from('company_info')
          .insert(companyData)
          .select()
          .single();

        if (error) throw error;
        savedCompany = data;
      }

      setCompanyInfo({
        id: savedCompany.id,
        name: savedCompany.name,
        description: savedCompany.description || '',
        industry: savedCompany.industry || '',
        founded: savedCompany.founded || '',
        size: savedCompany.size || '',
        mission: savedCompany.mission || '',
        values: Array.isArray(savedCompany.values) ? savedCompany.values : [],
        website: savedCompany.website,
        logoUrl: savedCompany.logo_url,
      });

      toast.success('Company information saved successfully');
    } catch (error: any) {
      console.error('Error saving company info:', error);
      toast.error('Failed to save company information: ' + error.message);
    }
  };

  // Handle saving brand guidelines
  const handleSaveBrandGuidelines = async (guidelines: BrandGuidelines) => {
    if (!user) {
      toast.error('You must be logged in to save brand guidelines');
      return;
    }

    try {
      const brandData = {
        user_id: user.id,
        company_id: companyInfo?.id || null,
        primary_color: guidelines.primaryColor,
        secondary_color: guidelines.secondaryColor,
        accent_color: guidelines.accentColor,
        neutral_color: guidelines.neutralColor,
        font_family: guidelines.fontFamily,
        secondary_font_family: guidelines.secondaryFontFamily,
        tone: guidelines.tone,
        keywords: guidelines.keywords,
        brand_personality: guidelines.brandPersonality,
        mission_statement: guidelines.missionStatement,
        do_use: guidelines.doUse,
        dont_use: guidelines.dontUse,
        logo_usage_notes: guidelines.logoUsageNotes,
        imagery_guidelines: guidelines.imageryGuidelines,
        target_audience: guidelines.targetAudience,
        brand_story: guidelines.brandStory,
        brand_values: guidelines.brandValues,
        brand_assets_url: guidelines.brandAssetsUrl,
        updated_at: new Date().toISOString(),
      };

      let savedGuidelines;
      if (brandGuidelines?.id) {
        // Update existing guidelines
        const { data, error } = await supabase
          .from('brand_guidelines')
          .update(brandData)
          .eq('id', brandGuidelines.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        savedGuidelines = data;
      } else {
        // Create new guidelines
        const { data, error } = await supabase
          .from('brand_guidelines')
          .insert(brandData)
          .select()
          .single();

        if (error) throw error;
        savedGuidelines = data;
      }

      setBrandGuidelines({
        id: savedGuidelines.id,
        companyId: savedGuidelines.company_id || '',
        primaryColor: savedGuidelines.primary_color,
        secondaryColor: savedGuidelines.secondary_color,
        accentColor: savedGuidelines.accent_color,
        neutralColor: savedGuidelines.neutral_color,
        fontFamily: savedGuidelines.font_family,
        secondaryFontFamily: savedGuidelines.secondary_font_family,
        tone: Array.isArray(savedGuidelines.tone) ? savedGuidelines.tone : [],
        keywords: Array.isArray(savedGuidelines.keywords) ? savedGuidelines.keywords : [],
        brandPersonality: savedGuidelines.brand_personality,
        missionStatement: savedGuidelines.mission_statement,
        doUse: Array.isArray(savedGuidelines.do_use) ? savedGuidelines.do_use : [],
        dontUse: Array.isArray(savedGuidelines.dont_use) ? savedGuidelines.dont_use : [],
        logoUsageNotes: savedGuidelines.logo_usage_notes,
        imageryGuidelines: savedGuidelines.imagery_guidelines,
        targetAudience: savedGuidelines.target_audience,
        brandStory: savedGuidelines.brand_story,
        brandValues: savedGuidelines.brand_values,
        brandAssetsUrl: savedGuidelines.brand_assets_url,
      });

      toast.success('Brand guidelines saved successfully');
    } catch (error: any) {
      console.error('Error saving brand guidelines:', error);
      toast.error('Failed to save brand guidelines: ' + error.message);
    }
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
  
  if (loading) {
    return (
      <motion.div className="min-h-screen flex flex-col bg-background" variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Navbar />
        <main className="flex-1 container py-8 rounded-3xl">
          <LoadingFallback />
        </main>
      </motion.div>
    );
  }
  
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
              <SolutionManager searchTerm={searchTerm} />
            </ErrorBoundary>
          </ContentBuilderProvider>
          
          {/* Brand Guidelines Display */}
          <BrandGuidelinesDisplay
            guidelines={brandGuidelines}
            companyId={companyInfo?.id || ''}
            onSave={handleSaveBrandGuidelines}
          />
          
          {/* Competitor Intelligence Section */}
          {user && (
            <CompetitorSection userId={user.id} />
          )}
        </motion.div>
      </main>
    </motion.div>;
};

export default Solutions;
