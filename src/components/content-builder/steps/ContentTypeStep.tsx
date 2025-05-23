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
  CheckCircle2
} from 'lucide-react';
import { ContentType, Solution } from '@/contexts/content-builder/types';
import { CompanyInfo, BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

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
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Add states for company info and brand guidelines
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [brandGuidelines, setBrandGuidelines] = useState<BrandGuidelines | null>(null);
  
  useEffect(() => {
    if (contentType && selectedSolution) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    }
  }, [contentType, selectedSolution, dispatch]);
  
  // Load solutions, company info, and brand guidelines
  useEffect(() => {
    fetchSolutions();
    
    // Load company info from localStorage
    const storedCompanyInfo = localStorage.getItem('companyInfo');
    if (storedCompanyInfo) {
      try {
        const parsedInfo = JSON.parse(storedCompanyInfo);
        setCompanyInfo(parsedInfo);
        
        // Store company info in context for content generation
        if (parsedInfo) {
          dispatch({ 
            type: 'SET_ADDITIONAL_INSTRUCTIONS', 
            payload: `Use the following company information: ${parsedInfo.name} - ${parsedInfo.description}. Industry: ${parsedInfo.industry}. Mission: ${parsedInfo.mission}.` 
          });
        }
      } catch (error) {
        console.error("Error parsing company info:", error);
      }
    }
    
    // Load brand guidelines from localStorage
    const storedBrandGuidelines = localStorage.getItem('brandGuidelines');
    if (storedBrandGuidelines) {
      try {
        const parsedGuidelines = JSON.parse(storedBrandGuidelines);
        setBrandGuidelines(parsedGuidelines);
        
        // Update additional instructions if brand guidelines exist
        if (parsedGuidelines) {
          dispatch({ 
            type: 'SET_ADDITIONAL_INSTRUCTIONS', 
            payload: `Use the following company information: ${companyInfo?.name || ''} - ${companyInfo?.description || ''}. 
            Follow these brand guidelines - Tone: ${parsedGuidelines.tone.join(', ')}. 
            Use keywords: ${parsedGuidelines.keywords.join(', ')}. 
            Do use: ${parsedGuidelines.doUse.join(', ')}. 
            Don't use: ${parsedGuidelines.dontUse.join(', ')}.` 
          });
        }
      } catch (error) {
        console.error("Error parsing brand guidelines:", error);
      }
    }
  }, [dispatch]);

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
          category: solution.category || "Business Solution", // Using the category from DB with fallback
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
      // Fallback to some default data if there's an error or no solutions
      setSolutions([{
        id: '1',
        name: 'Demo Solution',
        description: 'Demo solution for content creation',
        features: ["Feature 1", "Feature 2", "Feature 3"],
        useCases: ["Use case 1", "Use case 2"],
        painPoints: ["Pain point 1", "Pain point 2"],
        targetAudience: ["Audience 1", "Audience 2"],
        category: "Business Solution", // Default category 
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

  const handleNavigateToSolutions = () => {
    navigate('/solutions');
  };

  // Get initials for avatar fallback
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
      {/* Enhanced Company & Brand Info Section */}
      {(companyInfo || brandGuidelines) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-neon-purple/20 via-neon-blue/20 to-neon-purple/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gradient flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Brand Configuration Active
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
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
                        <Avatar className="h-12 w-12 rounded-lg border border-white/20">
                          <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold text-lg">
                            {getInitials(companyInfo.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <h4 className="font-semibold text-white truncate">{companyInfo.name}</h4>
                        </div>
                        <p className="text-sm text-primary/80 mb-2">{companyInfo.industry}</p>
                        <p className="text-xs text-white/70 line-clamp-2">{companyInfo.description}</p>
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
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                          <Palette className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                          Brand Guidelines
                        </h4>
                        <div className="space-y-2">
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
                          {brandGuidelines.keywords.length > 0 && (
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
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Content Type</h3>
        <p className="text-sm text-muted-foreground">
          Select the type of content you want to create.
        </p>
        
        <RadioGroup 
          value={contentType || ''} 
          onValueChange={handleSelectContentType}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {contentTypes.map((type) => (
            <div key={type.value} className="relative">
              <RadioGroupItem
                value={type.value}
                id={`content-type-${type.value}`}
                className="sr-only peer"
              />
              <Label
                htmlFor={`content-type-${type.value}`}
                className={`flex flex-col items-center justify-center h-32 p-4 rounded-lg border-2 cursor-pointer
                transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-muted/50
                ${contentType === type.value ? 'border-primary bg-primary/5' : 'border-muted'}`}
              >
                <type.icon className="h-8 w-8 mb-2" />
                <div className="font-medium text-center">{type.label}</div>
                <div className="text-xs text-center text-muted-foreground mt-1">{type.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Select a Solution</h3>
          <Button
            variant="outline"
            onClick={handleNavigateToSolutions}
            className="text-xs"
          >
            Manage Solutions
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose which business solution this content should promote or reference.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solutions.map((solution) => (
              <Card 
                key={solution.id} 
                className={`cursor-pointer transition-all hover:shadow-md hover:border-primary overflow-hidden
                  ${selectedSolution?.id === solution.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => handleSelectSolution(solution)}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-12 w-12 rounded-md border">
                      {solution.logoUrl ? (
                        <AvatarImage 
                          src={solution.logoUrl} 
                          alt={solution.name}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="rounded-md bg-primary/10 text-primary font-medium">
                          {getInitials(solution.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{solution.name}</h4>
                      {solution.externalUrl && (
                        <a 
                          href={solution.externalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    
                    {solution.features && solution.features.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium">Features:</span>
                        <ul className="text-xs text-muted-foreground mt-1 list-disc pl-4">
                          {solution.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                          {solution.features.length > 3 && (
                            <li className="text-xs text-primary">+{solution.features.length - 3} more features</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {solution.useCases && solution.useCases.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium">Use Cases:</span>
                        <ul className="text-xs text-muted-foreground mt-1 list-disc pl-4">
                          {solution.useCases.slice(0, 2).map((useCase, idx) => (
                            <li key={idx}>{useCase}</li>
                          ))}
                          {solution.useCases.length > 2 && (
                            <li className="text-xs text-primary">+{solution.useCases.length - 2} more use cases</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {solution.resources && solution.resources.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium">Resources:</span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {solution.resources.length} resource(s) available
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Import motion
import { motion } from 'framer-motion';
