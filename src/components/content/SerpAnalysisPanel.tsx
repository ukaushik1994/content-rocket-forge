
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Circle
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

interface SerpFeatureProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onAddToContent?: () => void;
}

const SerpFeature = ({ title, icon, children, onAddToContent }: SerpFeatureProps) => {
  return (
    <Card className="glass-panel mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {onAddToContent && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAddToContent} 
            className="h-8 px-2 text-xs"
          >
            <PlusCircle className="h-3 w-3 mr-1" />
            Add to Content
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

interface SerpAnalysisPanelProps {
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
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Analyzing search results...</p>
        </div>
      </div>
    );
  }

  if (!serpData) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <SearchX className="h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No SERP data available. Please start the analysis.</p>
      </div>
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

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium">SERP Analysis</h3>
      <div className="bg-glass p-4 rounded-md mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="text-primary h-5 w-5" />
          <h4 className="font-medium">Analyzing: <span className="text-primary">{mainKeyword}</span></h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-glass border border-white/10 rounded-md p-3 text-center">
            <div className="text-sm text-muted-foreground">Search Volume</div>
            <div className="text-xl font-semibold">{serpData.searchVolume?.toLocaleString() || 'N/A'}</div>
          </div>
          <div className="bg-glass border border-white/10 rounded-md p-3 text-center">
            <div className="text-sm text-muted-foreground">Difficulty</div>
            <div className="text-xl font-semibold">{serpData.keywordDifficulty ? `${serpData.keywordDifficulty}/100` : 'N/A'}</div>
          </div>
          <div className="bg-glass border border-white/10 rounded-md p-3 text-center">
            <div className="text-sm text-muted-foreground">Competition</div>
            <div className="text-xl font-semibold">{serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A'}</div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="related">Related Keywords</TabsTrigger>
          <TabsTrigger value="questions">People Also Ask</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="space-y-4">
            <SerpFeature 
              title="Content Strategy" 
              icon={<FileText className="h-4 w-4" />}
              onAddToContent={() => {
                const recommendationsText = serpData.recommendations?.join('\n- ') || '';
                onAddToContent(`## Content Strategy\n- ${recommendationsText}\n\n`, 'contentStrategy');
                toast.success('Added content strategy recommendations');
              }}
            >
              <div className="space-y-3">
                {serpData.recommendations?.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </SerpFeature>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SerpFeature 
                title="Top Keywords" 
                icon={<Search className="h-4 w-4" />}
                onAddToContent={() => {
                  const keywordsText = serpData.keywords?.join('\n- ') || '';
                  onAddToContent(`## Top Keywords\n- ${keywordsText}\n\n`, 'topKeywords');
                  toast.success('Added top keywords to your content');
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {serpData.keywords?.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      onClick={() => onAddToContent(keyword, 'keyword')}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </SerpFeature>
              
              <SerpFeature 
                title="Common Structure" 
                icon={<List className="h-4 w-4" />}
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
                <div className="text-sm space-y-2">
                  <p>Based on top-ranking content:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>H1: Use numbers (e.g., "10 Best {mainKeyword} in 2025")</li>
                    <li>Include definitions in the intro</li>
                    <li>Use H2 for main categories</li>
                    <li>Include a comparison table</li>
                    <li>End with FAQ section</li>
                  </ul>
                </div>
              </SerpFeature>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="related">
          {serpData.relatedSearches && serpData.relatedSearches.length > 0 ? (
            <div className="space-y-4">
              <SerpFeature 
                title="Related Searches" 
                icon={<Search className="h-4 w-4" />}
                onAddToContent={() => {
                  const relatedSearchesText = serpData.relatedSearches?.map(item => `- ${item.query}${item.volume ? ` (${item.volume} searches/month)` : ''}`).join('\n') || '';
                  onAddToContent(`## Related Searches\n${relatedSearchesText}\n\n`, 'relatedSearches');
                  toast.success('Added all related searches');
                }}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {serpData.relatedSearches.map((item, index) => (
                      <Badge 
                        key={index} 
                        className="bg-secondary flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                          onAddToContent(item.query, 'relatedKeyword');
                          toast.success(`Added "${item.query}" to your content`);
                        }}
                      >
                        {item.query}
                        {item.volume && (
                          <span className="text-xs bg-secondary/80 px-1 rounded-sm">{item.volume}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <h5 className="text-sm font-medium mb-2">Related Topics Strategy</h5>
                    <p className="text-sm text-muted-foreground">
                      Consider including these related searches in your content or creating separate pieces 
                      of content targeting these keywords for a comprehensive content strategy.
                    </p>
                    <Button 
                      className="mt-3 w-full"
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
              
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-md font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Content Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Based on related searches, these topics are missing from top-ranking content but have search demand:
                  </p>
                  <div className="space-y-3">
                    {serpData.relatedSearches.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{item.query}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={() => {
                            onAddToContent(`## ${item.query.charAt(0).toUpperCase() + item.query.slice(1)}\n\nThis section addresses the common questions about ${item.query}...\n\n`, 'contentGap');
                            toast.success(`Added section for "${item.query}"`);
                          }}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Section
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No related searches data available</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="questions">
          {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-medium mb-2">People Also Ask</h4>
              <Accordion type="single" collapsible className="w-full">
                {serpData.peopleAlsoAsk.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <span>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
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
                          className="mt-2"
                          onClick={() => addPeopleAlsoAsk(item.question, item.answer)}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add to FAQs
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button
                className="w-full mt-4"
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
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No questions data available</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="competitors">
          {serpData.topResults && serpData.topResults.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-medium mb-2">Top Ranking Content</h4>
              <Accordion type="single" collapsible className="w-full">
                {serpData.topResults.map((result, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center">
                          {result.position}
                        </span>
                        <span className="truncate">{result.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm space-y-2">
                        <p className="text-muted-foreground">{result.snippet}</p>
                        <a 
                          href={result.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary flex items-center gap-1 hover:underline"
                        >
                          <Link className="h-3 w-3" />
                          {result.link}
                        </a>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            onAddToContent(`### Based on [${result.title}](${result.link})\n\n`, 'competitorInsight');
                            toast.success('Added competitor insight section');
                          }}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add insight from this result
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button
                className="w-full mt-4"
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
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No top results data available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
