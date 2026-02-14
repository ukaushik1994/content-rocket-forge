import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, CheckCircle2, Loader2, Palette } from 'lucide-react';
import { ContentType, Solution } from '@/contexts/content-builder/types';
import { CompanyInfo, BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { contentFormats } from '@/components/content-repurposing/formats';

const jsonToStringArray = (jsonValue: any): string[] => {
  if (Array.isArray(jsonValue)) {
    return jsonValue.map(item => String(item)).filter(item => item !== 'null' && item !== 'undefined');
  }
  return [];
};

const contentTypes: Array<{value: ContentType; label: string; icon: React.ElementType; description: string}> = 
  contentFormats.map(format => ({
    value: format.id as ContentType,
    label: format.name,
    icon: format.icon,
    description: format.description
  }));

interface SolutionSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SolutionSelectionModal: React.FC<SolutionSelectionModalProps> = ({ isOpen, onOpenChange }) => {
  const { state, dispatch } = useContentBuilder();
  const { contentType, selectedSolution } = state;
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [brandGuidelines, setBrandGuidelines] = useState<BrandGuidelines | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchSolutions();
    if (user) loadCompanyData();
    else setDataLoading(false);
  }, [user]);

  // Auto-close after both are selected
  useEffect(() => {
    if (isOpen && selectedSolution && contentType) {
      const timer = setTimeout(() => {
        onOpenChange(false);
        toast.success(`Ready: ${selectedSolution.name} → ${contentTypes.find(ct => ct.value === contentType)?.label}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedSolution, contentType]);

  // Set additional instructions from company data
  useEffect(() => {
    if (companyInfo || brandGuidelines) {
      let instructions = '';
      if (companyInfo) {
        instructions += `Company: ${companyInfo.name}. `;
        if (companyInfo.description) instructions += `Description: ${companyInfo.description}. `;
        if (companyInfo.industry) instructions += `Industry: ${companyInfo.industry}. `;
        if (companyInfo.mission) instructions += `Mission: ${companyInfo.mission}. `;
      }
      if (brandGuidelines) {
        if (brandGuidelines.tone?.length) instructions += `Brand tone: ${brandGuidelines.tone.join(', ')}. `;
        if (brandGuidelines.keywords?.length) instructions += `Keywords to use: ${brandGuidelines.keywords.join(', ')}. `;
        if (brandGuidelines.doUse?.length) instructions += `Do use: ${brandGuidelines.doUse.join(', ')}. `;
        if (brandGuidelines.dontUse?.length) instructions += `Don't use: ${brandGuidelines.dontUse.join(', ')}. `;
      }
      if (instructions.trim()) {
        dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: instructions.trim() });
      }
    }
  }, [companyInfo, brandGuidelines, dispatch]);

  const loadCompanyData = async () => {
    if (!user) return;
    try {
      const { data: companyData } = await supabase.from('company_info').select('*').eq('user_id', user.id).maybeSingle();
      if (companyData) {
        setCompanyInfo({
          id: companyData.id, name: companyData.name, description: companyData.description || '',
          industry: companyData.industry || '', founded: companyData.founded || '', size: companyData.size || '',
          mission: companyData.mission || '', values: jsonToStringArray(companyData.values),
          website: companyData.website, logoUrl: companyData.logo_url,
        });
      }
      const { data: brandData } = await supabase.from('brand_guidelines').select('*').eq('user_id', user.id).maybeSingle();
      if (brandData) {
        setBrandGuidelines({
          id: brandData.id, companyId: brandData.company_id || '',
          primaryColor: brandData.primary_color, secondaryColor: brandData.secondary_color,
          accentColor: brandData.accent_color, neutralColor: brandData.neutral_color,
          fontFamily: brandData.font_family, secondaryFontFamily: brandData.secondary_font_family,
          tone: jsonToStringArray(brandData.tone), keywords: jsonToStringArray(brandData.keywords),
          brandPersonality: brandData.brand_personality, missionStatement: brandData.mission_statement,
          doUse: jsonToStringArray(brandData.do_use), dontUse: jsonToStringArray(brandData.dont_use),
          logoUsageNotes: brandData.logo_usage_notes, imageryGuidelines: brandData.imagery_guidelines,
          targetAudience: brandData.target_audience, brandStory: brandData.brand_story,
          brandValues: brandData.brand_values, brandAssetsUrl: brandData.brand_assets_url,
        });
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchSolutions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('solutions').select('*');
      if (error) throw error;
      if (data) {
        const formatted: Solution[] = data.map(s => ({
          id: s.id, name: s.name,
          features: Array.isArray(s.features) ? s.features.map(f => String(f)) : [],
          useCases: Array.isArray(s.use_cases) ? s.use_cases.map(u => String(u)) : [],
          painPoints: Array.isArray(s.pain_points) ? s.pain_points.map(p => String(p)) : [],
          targetAudience: Array.isArray(s.target_audience) ? s.target_audience.map(t => String(t)) : [],
          description: `${s.name} - Business Solution`, category: s.category || "Business Solution",
          logoUrl: s.logo_url, externalUrl: s.external_url,
          resources: Array.isArray(s.resources) ? s.resources.map(r => {
            if (typeof r === 'object' && r !== null && 'title' in r && 'url' in r) return { title: String(r.title || ''), url: String(r.url || '') };
            return { title: '', url: '' };
          }).filter(r => r.title && r.url) : []
        }));
        setSolutions(formatted);
      }
    } catch (error) {
      console.error("Error fetching solutions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectContentTypeFromSolution = (value: string, solution: Solution) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: value as ContentType });
    const enhanced = {
      ...solution,
      resources: solution.resources.map((r, i) => ({ id: `resource-${i}`, title: r.title, url: r.url, category: 'other' as const, order: i }))
    };
    dispatch({ type: 'SELECT_SOLUTION', payload: enhanced });
  };

  const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-0 gap-0 overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-primary/20 via-blue-500/20 to-primary/20 px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-primary" />
              Select Solution & Content Type
            </DialogTitle>
          </DialogHeader>

          {/* Company info compact */}
          {companyInfo && !dataLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mt-4">
              <Avatar className="h-10 w-10 rounded-lg border border-border/30">
                {companyInfo.logoUrl ? (
                  <AvatarImage src={companyInfo.logoUrl} alt={companyInfo.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold text-xs">
                    {getInitials(companyInfo.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{companyInfo.name}</span>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Solution avatars */}
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground mb-4">Click a solution to choose content type</p>
          
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : solutions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No solutions found. Add solutions first.</p>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              {solutions.map((solution) => (
                <DropdownMenu key={solution.id}>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      className={`cursor-pointer transition-all ${
                        selectedSolution?.id === solution.id 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg' 
                          : ''
                      }`}
                      title={solution.name}
                    >
                      <Avatar className="h-14 w-14 rounded-lg border border-border/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
                        {solution.logoUrl ? (
                          <AvatarImage src={solution.logoUrl} alt={solution.name} className="object-cover" />
                        ) : (
                          <AvatarFallback className="rounded-lg bg-muted text-foreground font-medium text-xs">
                            {getInitials(solution.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <p className="text-[10px] text-muted-foreground text-center mt-1 max-w-[56px] truncate">{solution.name}</p>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-sm border-border/30" align="center" side="bottom">
                    <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b border-border/20">
                      Content type for {solution.name}
                    </div>
                    {contentTypes.map((type) => (
                      <DropdownMenuItem
                        key={type.value}
                        onClick={() => handleSelectContentTypeFromSolution(type.value, solution)}
                        className="flex items-center gap-3 py-2 cursor-pointer"
                      >
                        <type.icon className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                        {contentType === type.value && selectedSolution?.id === solution.id && (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          )}

          {/* Current selection indicator */}
          {selectedSolution && contentType && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-sm text-green-400 bg-green-400/10 rounded-lg px-3 py-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{selectedSolution.name} → {contentTypes.find(ct => ct.value === contentType)?.label}</span>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
