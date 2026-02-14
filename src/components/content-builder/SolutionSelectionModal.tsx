import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, CheckCircle2, Palette, Sparkles } from 'lucide-react';
import { ContentType, Solution } from '@/contexts/content-builder/types';
import { CompanyInfo, BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { contentFormats } from '@/components/content-repurposing/formats';
import { Skeleton } from '@/components/ui/skeleton';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  // Auto-close after both are selected (800ms delay)
  useEffect(() => {
    if (isOpen && selectedSolution && contentType) {
      const timer = setTimeout(() => {
        onOpenChange(false);
        toast.success(`Ready: ${selectedSolution.name} → ${contentTypes.find(ct => ct.value === contentType)?.label}`);
      }, 800);
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

  const handleConfirm = () => {
    if (selectedSolution && contentType) {
      onOpenChange(false);
      toast.success(`Ready: ${selectedSolution.name} → ${contentTypes.find(ct => ct.value === contentType)?.label}`);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);

  const isSelectionComplete = !!selectedSolution && !!contentType;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Nearly opaque overlay */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[100] bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[100] w-full max-w-md translate-x-[-50%] translate-y-[-50%]",
            "bg-background border border-border/50 rounded-2xl shadow-2xl shadow-primary/10",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "overflow-hidden p-0"
          )}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-border/20">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                  Configure Content
                </DialogPrimitive.Title>
                <p className="text-xs text-muted-foreground mt-0.5">Select a solution, then pick your content type</p>
              </div>
            </div>

            {/* Company badge */}
            {companyInfo && !dataLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-3 ml-12">
                <Avatar className="h-6 w-6 rounded-md border border-border/30">
                  {companyInfo.logoUrl ? (
                    <AvatarImage src={companyInfo.logoUrl} alt={companyInfo.name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="rounded-md bg-primary/20 text-primary font-bold text-[9px]">
                      {getInitials(companyInfo.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-xs text-muted-foreground">{companyInfo.name}</span>
                <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">Active</span>
              </motion.div>
            )}
          </div>

          {/* Solutions grid */}
          <div className="px-6 py-5">
            {isLoading || dataLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <Skeleton className="h-16 w-16 rounded-xl" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  ))}
                </div>
              </div>
            ) : solutions.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No solutions found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Add solutions in your dashboard to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {solutions.map((solution) => {
                  const isSelected = selectedSolution?.id === solution.id;
                  return (
                    <DropdownMenu key={solution.id}>
                      <DropdownMenuTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group"
                        >
                          <div className={cn(
                            "relative rounded-xl p-0.5 transition-all duration-300",
                            isSelected
                              ? "bg-gradient-to-br from-primary via-primary/80 to-blue-500 shadow-lg shadow-primary/30"
                              : "bg-transparent group-hover:bg-border/50"
                          )}>
                            <Avatar className={cn(
                              "h-16 w-16 rounded-xl border-2 transition-all",
                              isSelected
                                ? "border-transparent"
                                : "border-border/30 group-hover:border-primary/30"
                            )}>
                              {solution.logoUrl ? (
                                <AvatarImage src={solution.logoUrl} alt={solution.name} className="object-cover" />
                              ) : (
                                <AvatarFallback className="rounded-xl bg-muted text-foreground font-semibold text-sm">
                                  {getInitials(solution.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-background"
                              >
                                <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                              </motion.div>
                            )}
                          </div>
                          <span className={cn(
                            "text-[11px] text-center max-w-[68px] truncate transition-colors",
                            isSelected ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                          )}>
                            {solution.name}
                          </span>
                        </motion.div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-60 bg-background border-border/40 shadow-xl"
                        align="center"
                        side="bottom"
                        sideOffset={8}
                      >
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/20">
                          Content type for <span className="text-foreground">{solution.name}</span>
                        </div>
                        {contentTypes.map((type) => {
                          const isActive = contentType === type.value && selectedSolution?.id === solution.id;
                          return (
                            <DropdownMenuItem
                              key={type.value}
                              onClick={() => handleSelectContentTypeFromSolution(type.value, solution)}
                              className={cn(
                                "flex items-center gap-3 py-2.5 cursor-pointer",
                                isActive && "bg-primary/10"
                              )}
                            >
                              <type.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{type.label}</div>
                                <div className="text-xs text-muted-foreground truncate">{type.description}</div>
                              </div>
                              {isActive && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with selection summary + confirm */}
          <AnimatePresence>
            {isSelectionComplete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-border/20"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-muted-foreground">
                      {selectedSolution?.name} → <span className="text-foreground">{contentTypes.find(ct => ct.value === contentType)?.label}</span>
                    </span>
                  </div>
                  <Button size="sm" onClick={handleConfirm} className="h-8 px-4 text-xs">
                    Confirm
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button */}
          <DialogPrimitive.Close className="absolute right-3 top-3 rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity focus:outline-none">
            <span className="sr-only">Close</span>
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
