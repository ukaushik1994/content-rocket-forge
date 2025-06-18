
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  BookOpen,
  ListTree,
  LayoutDashboard, 
  ShoppingBag, 
  Newspaper, 
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

// Helper function to safely convert Json to string array
const jsonToStringArray = (jsonValue: any): string[] => {
  if (Array.isArray(jsonValue)) {
    return jsonValue.map(item => String(item)).filter(item => item !== 'null' && item !== 'undefined');
  }
  return [];
};

const contentTypes: Array<{value: ContentType; label: string; icon: React.ElementType; description: string}> = [
  { value: 'blog', label: 'Blog Post', icon: BookOpen, description: 'Informative, educational content for your blog' },
  { value: 'glossary', label: 'Glossary', icon: ListTree, description: 'Definitions and explanations of industry terms' },
  { value: 'landingPage', label: 'Landing Page', icon: LayoutDashboard, description: 'Conversion-focused page for a specific purpose' },
  { value: 'article', label: 'Article', icon: Newspaper, description: 'In-depth piece on a specific topic' },
  { value: 'productDescription', label: 'Product Description', icon: ShoppingBag, description: 'Compelling content to showcase your products' }
];

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
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
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
    <div className="space-y-8">
      {/* Content Type Selection */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Select Content Type</h3>
              <p className="text-sm text-white/70 mb-4">Choose the type of content you want to create</p>
            </div>
            
            <RadioGroup 
              value={contentType} 
              onValueChange={handleSelectContentType}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {contentTypes.map((type) => (
                <Label
                  key={type.value}
                  htmlFor={type.value}
                  className="cursor-pointer"
                >
                  <Card className={`p-4 border transition-all hover:border-neon-blue/50 ${
                    contentType === type.value 
                      ? 'border-neon-blue bg-neon-blue/10' 
                      : 'border-white/10 bg-white/5'
                  }`}>
                    <CardContent className="p-0">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <type.icon className="h-5 w-5 text-neon-blue" />
                            <span className="font-medium text-white">{type.label}</span>
                          </div>
                          <p className="text-xs text-white/70">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Solutions Selection - Always Visible */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-white/10">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Select Solution</h3>
                <p className="text-sm text-white/70">Choose a solution to create content for</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNavigateToSolutions}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Manage Solutions
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : solutions.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {solutions.map((solution) => (
                  <DropdownMenu key={solution.id}>
                    <DropdownMenuTrigger asChild>
                      <Card 
                        className={`cursor-pointer transition-all hover:scale-105 hover:border-neon-blue/50 ${
                          selectedSolution?.id === solution.id 
                            ? 'border-neon-blue bg-neon-blue/10' 
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center gap-3">
                            <Avatar className="h-12 w-12 rounded-lg border border-white/20">
                              {solution.logoUrl ? (
                                <AvatarImage 
                                  src={solution.logoUrl} 
                                  alt={solution.name}
                                  className="object-cover"
                                />
                              ) : (
                                <AvatarFallback className="rounded-lg bg-white/10 text-white font-medium text-sm">
                                  {getInitials(solution.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="text-center">
                              <h4 className="font-medium text-white text-sm">{solution.name}</h4>
                              <p className="text-xs text-white/60 mt-1">{solution.category}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">No Solutions Found</h4>
                <p className="text-sm text-white/70 mb-4">
                  Create your first solution to get started with targeted content creation.
                </p>
                <Button 
                  onClick={handleNavigateToSolutions}
                  className="bg-neon-blue hover:bg-neon-blue/90"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Solutions
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Company & Brand Info Section - Only if data exists */}
      {(companyInfo || brandGuidelines) && !dataLoading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-neon-purple/20 via-neon-blue/20 to-neon-purple/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Company Logo/Avatar */}
                <Avatar className="h-16 w-16 rounded-xl border border-white/20">
                  {companyInfo?.logoUrl ? (
                    <AvatarImage 
                      src={companyInfo.logoUrl} 
                      alt={companyInfo.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 text-white font-bold text-lg">
                      {companyInfo ? getInitials(companyInfo.name) : <Building2 className="h-8 w-8" />}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <h3 className="text-xl font-semibold text-gradient">
                      {companyInfo?.name || 'Brand Configuration'} - Active
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Link className="h-4 w-4" />
                    <span>Company & Brand settings configured</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleNavigateToSolutions}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companyInfo && (
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white mb-1">{companyInfo.name}</h4>
                        <p className="text-sm text-primary/80 mb-2">{companyInfo.industry}</p>
                        <p className="text-xs text-white/70 line-clamp-2">{companyInfo.description}</p>
                        {companyInfo.values && companyInfo.values.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs font-medium text-primary">Values:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {companyInfo.values.slice(0, 2).map((value, idx) => (
                                <span key={idx} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                  {value}
                                </span>
                              ))}
                              {companyInfo.values.length > 2 && (
                                <span className="text-xs text-white/60">+{companyInfo.values.length - 2} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {brandGuidelines && (
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                          <Palette className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white mb-1">Brand Guidelines</h4>
                        <div className="space-y-2">
                          {brandGuidelines.tone && brandGuidelines.tone.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-primary">Tone:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {brandGuidelines.tone.slice(0, 3).map((tone, idx) => (
                                  <span key={idx} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                    {tone}
                                  </span>
                                ))}
                                {brandGuidelines.tone.length > 3 && (
                                  <span className="text-xs text-white/60">+{brandGuidelines.tone.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}
                          {brandGuidelines.keywords && brandGuidelines.keywords.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-primary">Keywords:</span>
                              <p className="text-xs text-white/70 truncate">
                                {brandGuidelines.keywords.slice(0, 3).join(', ')}
                                {brandGuidelines.keywords.length > 3 ? '...' : ''}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Solutions Selection Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-white mb-1">Solutions</h4>
                  <p className="text-sm text-white/70">Hover over solution logos to select content type</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNavigateToSolutions}
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs"
                >
                  Manage Solutions
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
                          title={`${solution.name} - Hover to select content type`}
                        >
                          <Avatar className="h-12 w-12 rounded-lg border border-white/20 hover:border-primary/50">
                            {solution.logoUrl ? (
                              <AvatarImage 
                                src={solution.logoUrl} 
                                alt={solution.name}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="rounded-lg bg-white/10 text-white font-medium text-sm">
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

            {/* Brand Colors Preview */}
            {brandGuidelines && (brandGuidelines.primaryColor || brandGuidelines.secondaryColor || brandGuidelines.accentColor) && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white/90">Brand Colors:</span>
                  <div className="flex gap-2">
                    {brandGuidelines.primaryColor && (
                      <div 
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: brandGuidelines.primaryColor }}
                        title={`Primary: ${brandGuidelines.primaryColor}`}
                      />
                    )}
                    {brandGuidelines.secondaryColor && (
                      <div 
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: brandGuidelines.secondaryColor }}
                        title={`Secondary: ${brandGuidelines.secondaryColor}`}
                      />
                    )}
                    {brandGuidelines.accentColor && (
                      <div 
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: brandGuidelines.accentColor }}
                        title={`Accent: ${brandGuidelines.accentColor}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
