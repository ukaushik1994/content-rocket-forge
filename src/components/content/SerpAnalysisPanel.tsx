
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  PlusCircle,
  SearchX,
  Search,
  Table,
  List,
  FileText,
  Image,
  HelpCircle,
  TrendingUp,
  Link,
  Circle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { motion } from 'framer-motion';

interface SerpFeatureProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onAddToContent?: () => void;
  variant?: 'default' | 'purple' | 'blue' | 'green';
}

const SerpFeature = ({ 
  title, 
  icon, 
  children, 
  onAddToContent,
  variant = 'default'
}: SerpFeatureProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getGradient = () => {
    switch(variant) {
      case 'purple':
        return 'hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-purple-700/5';
      case 'blue':
        return 'hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-blue-700/5';
      case 'green':
        return 'hover:bg-gradient-to-br hover:from-green-500/10 hover:to-green-700/5';
      default:
        return 'hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card 
        className={`glass-panel transition-all duration-300 border-white/10 ${getGradient()} ${isHovered ? 'shadow-lg' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isHovered ? 'border-b border-white/5' : ''}`}>
          <CardTitle className="text-md font-medium flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {onAddToContent && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onAddToContent} 
              className={`h-8 px-2 text-xs transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Add to Content
            </Button>
          )}
        </CardHeader>
        <CardContent className="transition-all duration-300">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpAnalysisPanel({ 
  serpData, 
  isLoading, 
  mainKeyword,
  onAddToContent = () => {}
}: SerpAnalysisPanelProps) {
  const [expandedSections, setExpandedSections] = useState<{
    overview: boolean;
    keywords: boolean;
    questions: boolean;
    competitors: boolean;
  }>({
    overview: true,
    keywords: false,
    questions: false,
    competitors: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary h-8 w-8 animate-pulse" />
          </div>
          <p className="mt-6 text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">Analyzing search results...</p>
          <p className="text-sm text-muted-foreground mt-2">Extracting insights from top-ranking content</p>
        </div>
      </div>
    );
  }

  if (!serpData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 bg-gradient-to-b from-white/5 to-white/0 rounded-xl border border-white/10"
      >
        <SearchX className="h-20 w-20 text-white/20" />
        <p className="mt-6 text-lg font-medium">No SERP data available</p>
        <p className="text-muted-foreground mt-2 mb-6">Start the analysis to see insights for your target keyword</p>
        <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-colors duration-300">
          <Search className="h-4 w-4 mr-2" />
          Start Analysis
        </Button>
      </motion.div>
    );
  }

  const addPeopleAlsoAsk = (question: string, answer?: string) => {
    const content = `### ${question}\n${answer || 'No answer available'}\n\n`;
    onAddToContent(content, 'peopleAlsoAsk');
    toast.success(`Added "${question}" to your content`);
  };

  const addFeaturedSnippet = (snippet: { type: string; content: string }) => {
    let content = '';
    
    switch (snippet.type) {
      case 'definition':
        content = `## Definition\n${snippet.content}\n\n`;
        break;
      case 'list':
        content = `## Key Steps\n${snippet.content}\n\n`;
        break;
      case 'table':
        content = `## Comparison\n${snippet.content}\n\n`;
        break;
      default:
        content = `## Featured Information\n${snippet.content}\n\n`;
    }
    
    onAddToContent(content, 'featuredSnippet');
    toast.success(`Added ${snippet.type} snippet to your content`);
  };

  const SectionHeader = ({ title, expanded, onToggle }: { title: string; expanded: boolean; onToggle: () => void }) => (
    <div 
      className="flex items-center justify-between py-3 px-4 bg-white/5 backdrop-blur-md rounded-lg cursor-pointer mb-4"
      onClick={onToggle}
    >
      <h3 className="text-lg font-medium flex items-center gap-2">
        {expanded ? 
          <Circle className="h-2 w-2 text-primary fill-primary" /> : 
          <Circle className="h-2 w-2 text-white/30" />
        }
        {title}
      </h3>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Search Volume and Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-5 rounded-xl border border-white/10 backdrop-blur-xl shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <Search className="text-primary h-6 w-6" />
          <h3 className="font-medium text-xl">Analyzing: <span className="text-gradient">{mainKeyword}</span></h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-glass border border-white/10 rounded-md p-4 backdrop-blur-md">
            <div className="text-sm text-muted-foreground mb-1">Search Volume</div>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
                {serpData.searchVolume?.toLocaleString() || 'N/A'}
              </div>
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-glass border border-white/10 rounded-md p-4 backdrop-blur-md">
            <div className="text-sm text-muted-foreground mb-1">Keyword Difficulty</div>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                {serpData.keywordDifficulty ? `${serpData.keywordDifficulty}/100` : 'N/A'}
              </div>
              <div className="w-16">
                {serpData.keywordDifficulty && (
                  <div className="relative w-full h-2 bg-blue-900/30 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      style={{ width: `${serpData.keywordDifficulty}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-glass border border-white/10 rounded-md p-4 backdrop-blur-md">
            <div className="text-sm text-muted-foreground mb-1">Competition</div>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                {serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A'}
              </div>
              <div className="w-16">
                {serpData.competitionScore && (
                  <div className="relative w-full h-2 bg-green-900/30 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      style={{ width: `${serpData.competitionScore * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Section */}
      <div className="space-y-4">
        <SectionHeader 
          title="Content Strategy" 
          expanded={expandedSections.overview}
          onToggle={() => toggleSection('overview')}
        />
        
        {expandedSections.overview && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SerpFeature 
                title="Strategy Recommendations" 
                icon={<FileText className="h-4 w-4 text-purple-400" />}
                variant="purple"
                onAddToContent={() => {
                  const recommendationsText = serpData.recommendations?.join('\n- ') || '';
                  onAddToContent(`## Content Strategy\n- ${recommendationsText}\n\n`, 'contentStrategy');
                  toast.success('Added content strategy recommendations');
                }}
              >
                <div className="space-y-3">
                  {serpData.recommendations?.map((recommendation, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </SerpFeature>
              
              <SerpFeature 
                title="Top Keywords" 
                icon={<Search className="h-4 w-4 text-blue-400" />}
                variant="blue"
                onAddToContent={() => {
                  const keywordsText = serpData.keywords?.join('\n- ') || '';
                  onAddToContent(`## Top Keywords\n- ${keywordsText}\n\n`, 'topKeywords');
                  toast.success('Added top keywords to your content');
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {serpData.keywords?.map((keyword, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Badge 
                        className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 cursor-pointer border border-blue-500/20"
                        onClick={() => {
                          onAddToContent(keyword, 'keyword');
                          toast.success(`Added "${keyword}" keyword`);
                        }}
                      >
                        {keyword}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </SerpFeature>
            
              <SerpFeature 
                title="Common Structure" 
                icon={<List className="h-4 w-4 text-green-400" />}
                variant="green"
                onAddToContent={() => {
                  const structureText = `
## Recommended Content Structure
- H1: Use numbers (e.g., "10 Best ${mainKeyword} in 2025")
- Include definitions in the intro
- Use H2 for main categories
- Include a comparison table
- End with FAQ section
                  `;
                  onAddToContent(structureText, 'contentStructure');
                  toast.success('Added content structure recommendations');
                }}
              >
                <ul className="space-y-2">
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">H1: Use numbers (e.g., "10 Best {mainKeyword} in 2025")</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Include definitions in the intro</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Use H2 for main categories</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Include a comparison table</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">End with FAQ section</span>
                  </motion.li>
                </ul>
              </SerpFeature>
              
              <SerpFeature 
                title="Content Gap Analysis" 
                icon={<TrendingUp className="h-4 w-4 text-purple-400" />}
                variant="purple"
                onAddToContent={() => {
                  const gapAnalysisText = serpData.relatedSearches?.slice(0, 3).map(item => 
                    `### ${item.query}\nThis topic is missing from top-ranking content but has search demand.\n\n`
                  ).join('') || '';
                  
                  onAddToContent(`## Content Gap Analysis\n\n${gapAnalysisText}`, 'contentGap');
                  toast.success('Added content gap analysis');
                }}
              >
                <p className="text-sm mb-3">
                  These topics are missing from top-ranking content but have search demand:
                </p>
                <div className="space-y-2">
                  {serpData.relatedSearches?.slice(0, 3).map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="text-sm">{item.query}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => {
                          onAddToContent(`## ${item.query.charAt(0).toUpperCase() + item.query.slice(1)}\n\nThis section addresses the common questions about ${item.query}...\n\n`, 'contentGap');
                          toast.success(`Added section for "${item.query}"`);
                        }}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </SerpFeature>
            </div>
          </div>
        )}
      </div>
      
      {/* Related Keywords Section */}
      <div className="space-y-4">
        <SectionHeader 
          title="Related Keywords" 
          expanded={expandedSections.keywords}
          onToggle={() => toggleSection('keywords')}
        />
        
        {expandedSections.keywords && serpData.relatedSearches && serpData.relatedSearches.length > 0 && (
          <SerpFeature 
            title="Related Searches" 
            icon={<Search className="h-4 w-4 text-blue-400" />}
            variant="blue"
            onAddToContent={() => {
              const relatedSearchesText = serpData.relatedSearches?.map(item => `- ${item.query}${item.volume ? ` (${item.volume} searches/month)` : ''}`).join('\n') || '';
              onAddToContent(`## Related Searches\n${relatedSearchesText}\n\n`, 'relatedSearches');
              toast.success('Added all related searches');
            }}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-4">
                {serpData.relatedSearches.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge 
                      className="bg-gradient-to-r from-blue-800/40 to-purple-800/40 border border-white/10 flex items-center gap-2 cursor-pointer hover:from-blue-800/60 hover:to-purple-800/60 transition-colors"
                      onClick={() => {
                        onAddToContent(item.query, 'relatedKeyword');
                        toast.success(`Added "${item.query}" to your content`);
                      }}
                    >
                      {item.query}
                      {item.volume && (
                        <span className="text-xs bg-white/10 px-1 rounded-sm">{item.volume}</span>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>
              
              <div className="pt-3 border-t border-white/10">
                <h5 className="text-sm font-medium mb-2">Related Topics Strategy</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  Consider including these related searches in your content or creating separate pieces 
                  of content targeting these keywords for a comprehensive content strategy.
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-white/10"
                  variant="outline"
                  onClick={() => {
                    const relatedContent = serpData.relatedSearches
                      ?.slice(0, 3)
                      .map(item => `- **${item.query}**: Consider covering this topic in your content.\n`)
                      .join('');
                    
                    onAddToContent(`## Related Topics to Cover\n\n${relatedContent}\n`, 'relatedTopics');
                    toast.success('Added related topics section');
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Related Topics Section
                </Button>
              </div>
            </div>
          </SerpFeature>
        )}
        
        {expandedSections.keywords && (!serpData.relatedSearches || serpData.relatedSearches.length === 0) && (
          <div className="py-4 text-center bg-white/5 rounded-lg">
            <p className="text-muted-foreground">No related searches data available</p>
          </div>
        )}
      </div>
      
      {/* Questions Section */}
      <div className="space-y-4">
        <SectionHeader 
          title="People Also Ask" 
          expanded={expandedSections.questions}
          onToggle={() => toggleSection('questions')}
        />
        
        {expandedSections.questions && serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 && (
          <div className="space-y-4 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-purple-900/10 p-4 rounded-xl border border-white/10">
            <Accordion type="single" collapsible className="w-full">
              {serpData.peopleAlsoAsk.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionItem value={`item-${index}`} className="border-white/10">
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <span className="hover:text-primary transition-colors">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-white/5 rounded-lg p-3 mt-2">
                      <div className="text-sm space-y-2">
                        <p className="text-muted-foreground">{item.answer || 'No answer available'}</p>
                        {item.source && (
                          <a 
                            href={item.source} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary flex items-center gap-1 hover:underline text-xs"
                          >
                            <Link className="h-3 w-3" />
                            Source
                          </a>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 bg-white/10 hover:bg-white/20 border border-white/10"
                          onClick={() => addPeopleAlsoAsk(item.question, item.answer)}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add to FAQs
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
            
            <Button
              className="w-full mt-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-white/10"
              onClick={() => {
                const allQuestions = serpData.peopleAlsoAsk?.map(item => 
                  `### ${item.question}\n${item.answer || 'No answer available'}\n\n`
                ).join('');
                onAddToContent(`## Frequently Asked Questions\n\n${allQuestions}`, 'faqSection');
                toast.success('Added complete FAQ section');
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Complete FAQ Section
            </Button>
          </div>
        )}
        
        {expandedSections.questions && (!serpData.peopleAlsoAsk || serpData.peopleAlsoAsk.length === 0) && (
          <div className="py-4 text-center bg-white/5 rounded-lg">
            <p className="text-muted-foreground">No questions data available</p>
          </div>
        )}
      </div>
      
      {/* Competitor Analysis Section */}
      <div className="space-y-4">
        <SectionHeader 
          title="Competitor Analysis" 
          expanded={expandedSections.competitors}
          onToggle={() => toggleSection('competitors')}
        />
        
        {expandedSections.competitors && serpData.topResults && serpData.topResults.length > 0 && (
          <div className="space-y-4 bg-gradient-to-br from-blue-900/10 via-slate-900/10 to-blue-900/10 p-4 rounded-xl border border-white/10">
            {serpData.topResults.map((result, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-white/10 rounded-lg bg-white/5 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                      {result.position}
                    </div>
                    <h4 className="font-medium text-sm line-clamp-1">{result.title}</h4>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{result.snippet}</p>
                  
                  <div className="flex items-center justify-between">
                    <a 
                      href={result.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 hover:underline text-xs"
                    >
                      <Link className="h-3 w-3" />
                      {result.link.substring(0, 35)}...
                    </a>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        onAddToContent(`### Based on [${result.title}](${result.link})\n\n${result.snippet}\n\n`, 'competitorInsight');
                        toast.success('Added competitor insight');
                      }}
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add insight
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <Button
              className="w-full mt-4 bg-gradient-to-r from-blue-600/20 to-slate-600/20 hover:from-blue-600/30 hover:to-slate-600/30 border border-white/10"
              onClick={() => {
                let competitorInsightsContent = `## Competitor Research Analysis\n\n`;
                serpData.topResults?.slice(0, 3).forEach(result => {
                  competitorInsightsContent += `### ${result.title}\n${result.snippet}\n[Source](${result.link})\n\n`;
                });
                onAddToContent(competitorInsightsContent, 'competitorAnalysis');
                toast.success('Added competitor analysis section');
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Complete Competitor Analysis
            </Button>
          </div>
        )}
        
        {expandedSections.competitors && (!serpData.topResults || serpData.topResults.length === 0) && (
          <div className="py-4 text-center bg-white/5 rounded-lg">
            <p className="text-muted-foreground">No top results data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
