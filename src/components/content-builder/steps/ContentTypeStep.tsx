
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Loader2,
  ExternalLink,
  Building2,
  Palette,
  Edit3,
  CheckCircle2,
  Link
} from 'lucide-react';
import { ContentType, Solution } from '@/contexts/content-builder/types';
import { CompanyInfo, BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { contentFormats } from '@/components/content-repurposing/formats';

// Helper function to safely convert Json to string array
const jsonToStringArray = (jsonValue: any): string[] => {
  if (Array.isArray(jsonValue)) {
    return jsonValue.map(item => String(item)).filter(item => item !== 'null' && item !== 'undefined');
  }
  return [];
};

// Map content formats to content types for the UI
const contentTypes: Array<{value: ContentType; label: string; icon: React.ElementType; description: string}> = 
  contentFormats.map(format => ({
    value: format.id as ContentType,
    label: format.name,
    icon: format.icon,
    description: format.description
  }));

export const ContentTypeStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { contentType, selectedSolution } = state;
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Add states for company info and brand guidelines
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [brandGuidelines, setBrandGuidelines] = useState<BrandGuidelines | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  useEffect(() => {
    if (contentType && selectedSolution) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    }
  }, [contentType, selectedSolution, dispatch]);
  
  useEffect(() => {
    fetchSolutions();
    
    if (user) {
      loadCompanyData();
    } else {
      setDataLoading(false);
    }
  }, [user]);

  const loadCompanyData = async () => {
    if (!user) return;

    try {
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
    } finally {
      setDataLoading(false);
    }
  };

  // Update additional instructions when company info or brand guidelines change
  useEffect(() => {
    if (companyInfo || brandGuidelines) {
      let instructions = '';
      
      if (companyInfo) {
        instructions += `Company: ${companyInfo.name}. `;
        if (companyInfo.description) {
          instructions += `Description: ${companyInfo.description}. `;
        }
        if (companyInfo.industry) {
          instructions += `Industry: ${companyInfo.industry}. `;
        }
        if (companyInfo.mission) {
          instructions += `Mission: ${companyInfo.mission}. `;
        }
      }
      
      if (brandGuidelines) {
        if (brandGuidelines.tone && brandGuidelines.tone.length > 0) {
          instructions += `Brand tone: ${brandGuidelines.tone.join(', ')}. `;
        }
        if (brandGuidelines.keywords && brandGuidelines.keywords.length > 0) {
          instructions += `Keywords to use: ${brandGuidelines.keywords.join(', ')}. `;
        }
        if (brandGuidelines.doUse && brandGuidelines.doUse.length > 0) {
          instructions += `Do use: ${brandGuidelines.doUse.join(', ')}. `;
        }
        if (brandGuidelines.dontUse && brandGuidelines.dontUse.length > 0) {
          instructions += `Don't use: ${brandGuidelines.dontUse.join(', ')}. `;
        }
      }
      
      if (instructions.trim()) {
        dispatch({ 
          type: 'SET_ADDITIONAL_INSTRUCTIONS', 
          payload: instructions.trim()
        });
      }
    }
  }, [companyInfo, brandGuidelines, dispatch]);

  const fetchSolutions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Transform the data from jsonb columns to the expected format with validation
        const formattedSolutions: Solution[] = data.map(solution => ({
          id: solution.id,
          name: solution.name,
          features: Array.isArray(solution.features) 
            ? solution.features.map(f => String(f)) 
            : [],
          useCases: Array.isArray(solution.use_cases) 
            ? solution.use_cases.map(u => String(u)) 
            : [],
          painPoints: Array.isArray(solution.pain_points) 
            ? solution.pain_points.map(p => String(p)) 
            : [],
          targetAudience: Array.isArray(solution.target_audience) 
            ? solution.target_audience.map(t => String(t)) 
            : [],
          description: `${solution.name} - Business Solution`,
          category: solution.category || "Business Solution",
          logoUrl: solution.logo_url,
          externalUrl: solution.external_url,
          resources: Array.isArray(solution.resources) 
            ? solution.resources.map(resource => {
                if (typeof resource === 'object' && resource !== null && 'title' in resource && 'url' in resource) {
                  return {
                    title: String(resource.title || ''),
                    url: String(resource.url || '')
                  };
                }
                return { title: '', url: '' };
              }).filter(r => r.title && r.url)
            : []
        }));
        setSolutions(formattedSolutions);
      }
    } catch (error) {
      console.error("Error fetching solutions:", error);
      setSolutions([{
        id: '1',
        name: 'Demo Solution',
        description: 'Demo solution for content creation',
        features: ["Feature 1", "Feature 2", "Feature 3"],
        useCases: ["Use case 1", "Use case 2"],
        painPoints: ["Pain point 1", "Pain point 2"],
        targetAudience: ["Audience 1", "Audience 2"],
        category: "Business Solution",
        logoUrl: null,
        externalUrl: null,
        resources: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectContentType = (value: string) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: value as ContentType });
  };
  
  const handleSelectSolution = (solution: Solution) => {
    // Convert Solution to EnhancedSolution format
    const enhancedSolution = {
      ...solution,
      resources: solution.resources.map((resource, index) => ({
        id: `resource-${index}`,
        title: resource.title,
        url: resource.url,
        category: 'other' as const,
        order: index
      }))
    };
    dispatch({ type: 'SELECT_SOLUTION', payload: enhancedSolution });
    toast.success(`Selected solution: ${solution.name}`);
  };

  const handleSelectContentTypeFromSolution = (contentTypeValue: string, solution: Solution) => {
    handleSelectContentType(contentTypeValue);
    handleSelectSolution(solution);
    toast.success(`Selected ${contentTypes.find(ct => ct.value === contentTypeValue)?.label} for ${solution.name}`);
  };

  const handleNavigateToSolutions = () => {
    navigate('/solutions');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Compact Company & Solutions Section */}
      {(companyInfo || brandGuidelines) && !dataLoading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-neon-purple/20 via-neon-blue/20 to-neon-purple/20 p-4">
            {/* Compact Header - Single Line */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-lg border border-white/20">
                  {companyInfo?.logoUrl ? (
                    <AvatarImage 
                      src={companyInfo.logoUrl} 
                      alt={companyInfo.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 text-white font-bold">
                      {companyInfo ? getInitials(companyInfo.name) : <Building2 className="h-6 w-6" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <h3 className="text-lg font-semibold text-gradient">
                      {companyInfo?.name || 'Brand Configuration'}
                    </h3>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Active</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNavigateToSolutions}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>

            {/* Solutions Selection Section */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">Solutions</h4>
                  <p className="text-xs text-white/60">Select content type for each solution</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleNavigateToSolutions}
                  className="text-white/70 hover:text-white text-xs h-6"
                >
                  Manage
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  {solutions.map((solution) => (
                    <DropdownMenu key={solution.id}>
                      <DropdownMenuTrigger asChild>
                        <div
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            selectedSolution?.id === solution.id 
                              ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent' 
                              : ''
                          }`}
                          title={`${solution.name} - Click to select content type`}
                        >
                          <Avatar className="h-16 w-16 rounded-lg border border-white/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
                            {solution.logoUrl ? (
                              <AvatarImage 
                                src={solution.logoUrl} 
                                alt={solution.name}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="rounded-lg bg-white/10 text-white font-medium">
                                {getInitials(solution.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-56 bg-background/95 backdrop-blur-sm border-white/20"
                        align="center"
                        side="bottom"
                      >
                        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b border-white/10">
                          Select content type for {solution.name}
                        </div>
                        {contentTypes.map((type) => (
                          <DropdownMenuItem
                            key={type.value}
                            onClick={() => handleSelectContentTypeFromSolution(type.value, solution)}
                            className="flex items-center gap-3 py-2 cursor-pointer hover:bg-white/10"
                          >
                            <type.icon className="h-4 w-4" />
                            <div className="flex-1">
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
};
