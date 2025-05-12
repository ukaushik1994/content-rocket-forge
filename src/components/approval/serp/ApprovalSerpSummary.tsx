
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, HelpCircle, FileText, Tag, Heading, FileSearch, RefreshCw, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SerpAnalysisResult } from '@/types/serp';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';
import {
  SerpSectionHeader,
  SerpKeywordsSection,
  SerpQuestionsSection,
  SerpEntitiesSection,
  SerpHeadingsSection
} from '@/components/content/serp-analysis';
import { AVAILABLE_COUNTRIES, SearchCountry } from '@/components/content-builder/steps/writing/ContentGenerationHeader';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';

interface ApprovalSerpSummaryProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  className?: string;
}

export const ApprovalSerpSummary: React.FC<ApprovalSerpSummaryProps> = ({
  serpData,
  isLoading,
  mainKeyword,
  onAddToContent = () => {},
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('keywords');
  const [localSerpData, setLocalSerpData] = useState<SerpAnalysisResult | null>(serpData);
  const [isRefreshingSection, setIsRefreshingSection] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    serpData?.searchCountries || ['us']
  );
  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = useState(false);

  const toggleCountry = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      if (selectedCountries.length > 1) { // Always keep at least one country selected
        setSelectedCountries(selectedCountries.filter(code => code !== countryCode));
      }
    } else {
      setSelectedCountries([...selectedCountries, countryCode]);
    }
  };

  const refreshCurrentSection = async () => {
    if (!mainKeyword || isRefreshingSection) return;
    
    setIsRefreshingSection(true);
    
    try {
      // Fetch new SERP data with refresh flag set to true and selected countries
      const newSerpData = await analyzeKeywordSerp(mainKeyword, true, selectedCountries);
      
      if (newSerpData && localSerpData) {
        // Create updated data by merging the new section data with existing data
        const updatedData = { ...localSerpData } as SerpAnalysisResult;
        
        switch(activeTab) {
          case 'keywords':
            updatedData.keywords = newSerpData.keywords;
            updatedData.relatedSearches = newSerpData.relatedSearches;
            toast.success('Keywords refreshed successfully');
            break;
          case 'questions':
            updatedData.peopleAlsoAsk = newSerpData.peopleAlsoAsk;
            toast.success('Questions refreshed successfully');
            break;
          case 'entities':
            updatedData.entities = newSerpData.entities;
            toast.success('Entities refreshed successfully');
            break;
          case 'headings':
            updatedData.headings = newSerpData.headings;
            toast.success('Headings refreshed successfully');
            break;
        }
        
        updatedData.searchCountries = selectedCountries;
        
        // Update the local state
        setLocalSerpData(updatedData);
      }
    } catch (error) {
      console.error(`Error refreshing ${activeTab}:`, error);
      toast.error(`Failed to refresh ${activeTab}`);
    } finally {
      setIsRefreshingSection(false);
    }
  };

  const refreshWithNewCountries = async () => {
    if (!mainKeyword || isRefreshingSection) return;
    
    setIsRefreshingSection(true);
    
    try {
      // Fetch new SERP data with the updated country selection
      const newSerpData = await analyzeKeywordSerp(mainKeyword, true, selectedCountries);
      
      // Update the local state with the new data
      setLocalSerpData(newSerpData);
      setIsCountryPopoverOpen(false);
      
      toast.success(`SERP data refreshed for selected countries`);
    } catch (error) {
      console.error(`Error refreshing data with new countries:`, error);
      toast.error(`Failed to refresh data`);
    } finally {
      setIsRefreshingSection(false);
    }
  };

  // Use localSerpData if available, otherwise use the prop
  const displayData = localSerpData || serpData;

  if (isLoading) {
    return (
      <div className={`p-4 bg-white/5 border border-white/10 rounded-lg ${className}`}>
        <div className="h-20 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple"></div>
          <p className="ml-3 text-white/70">Loading SERP data...</p>
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className={`p-4 bg-white/5 border border-white/10 rounded-lg ${className}`}>
        <div className="flex flex-col items-center justify-center py-6">
          <Search className="h-8 w-8 text-white/30 mb-2" />
          <p className="text-white/50">No SERP data available</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-white/10 bg-black/20 backdrop-blur-lg overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-neon-purple" />
            <h3 className="text-sm font-medium">
              SERP Analysis: <span className="text-neon-purple">{mainKeyword}</span>
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover open={isCountryPopoverOpen} onOpenChange={setIsCountryPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-white/70 hover:text-white"
                >
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  {selectedCountries.length === 1 
                    ? AVAILABLE_COUNTRIES.find(c => c.code === selectedCountries[0])?.name
                    : `${selectedCountries.length} Countries`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Select Search Countries</h4>
                  <p className="text-xs text-muted-foreground">
                    Data will be fetched from selected countries
                  </p>
                  
                  <ScrollArea className="h-60 pr-4 mt-2">
                    <div className="space-y-2">
                      {AVAILABLE_COUNTRIES.map((country) => (
                        <div 
                          key={country.code} 
                          className="flex items-center space-x-2 py-1.5 px-1 rounded hover:bg-white/5"
                        >
                          <Checkbox 
                            id={`country-${country.code}`}
                            checked={selectedCountries.includes(country.code)}
                            onCheckedChange={() => toggleCountry(country.code)}
                            disabled={selectedCountries.length === 1 && selectedCountries.includes(country.code)}
                          />
                          <label 
                            htmlFor={`country-${country.code}`}
                            className="flex-1 text-sm cursor-pointer"
                          >
                            {country.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCountries.map(code => {
                      const country = AVAILABLE_COUNTRIES.find(c => c.code === code);
                      return (
                        <Badge key={code} variant="outline" className="bg-white/10 flex items-center gap-1">
                          {country?.name}
                          {selectedCountries.length > 1 && (
                            <button 
                              className="ml-1 text-white/70 hover:text-white" 
                              onClick={() => toggleCountry(code)}
                            >
                              <span className="sr-only">Remove</span>
                              ×
                            </button>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={refreshWithNewCountries}
                    disabled={isRefreshingSection}
                  >
                    <Check className="h-4 w-4 mr-1" /> Apply & Refresh
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshCurrentSection}
              disabled={isRefreshingSection}
              className="h-7 px-2 text-xs text-white/70 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshingSection ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none p-0 grid grid-cols-4">
          <TabsTrigger
            value="keywords"
            className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
            onClick={() => setActiveTab('keywords')}
          >
            <Tag className="h-4 w-4 mr-2" /> Keywords
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
            onClick={() => setActiveTab('questions')}
          >
            <HelpCircle className="h-4 w-4 mr-2" /> Questions
          </TabsTrigger>
          <TabsTrigger
            value="entities"
            className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
            onClick={() => setActiveTab('entities')}
          >
            <FileSearch className="h-4 w-4 mr-2" /> Entities
          </TabsTrigger>
          <TabsTrigger
            value="headings"
            className="rounded-none data-[state=active]:bg-white/5"
            onClick={() => setActiveTab('headings')}
          >
            <Heading className="h-4 w-4 mr-2" /> Headings
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-2 max-h-[400px] overflow-y-auto">
          <TabsContent value="keywords" className="mt-0 py-2">
            <SerpKeywordsSection
              serpData={displayData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          </TabsContent>
          
          <TabsContent value="questions" className="mt-0 py-2">
            <SerpQuestionsSection
              serpData={displayData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          </TabsContent>
          
          <TabsContent value="entities" className="mt-0 py-2">
            <SerpEntitiesSection
              serpData={displayData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          </TabsContent>
          
          <TabsContent value="headings" className="mt-0 py-2">
            <SerpHeadingsSection
              serpData={displayData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
