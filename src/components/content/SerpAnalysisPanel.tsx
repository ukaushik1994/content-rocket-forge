
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
      <div className="bg-glass p-4 rounded-md mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="text-primary h-5 w-5" />
          <h4 className="font-medium">Analyzing: <span className="text-primary">{mainKeyword}</span></h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organic">Top Results</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="features">SERP Features</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="space-y-4">
            <SerpFeature title="Content Strategy" icon={<FileText className="h-4 w-4" />}>
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
              <SerpFeature title="Top Keywords" icon={<Search className="h-4 w-4" />}>
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
              
              <SerpFeature title="Common Structure" icon={<List className="h-4 w-4" />}>
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
        
        <TabsContent value="organic">
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
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No top results data available</p>
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
                          Add to FAQ Section
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No "People Also Ask" questions available</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="features">
          <div className="space-y-6">
            {serpData.featuredSnippets && serpData.featuredSnippets.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium mb-3">Featured Snippets</h4>
                <div className="grid grid-cols-1 gap-4">
                  {serpData.featuredSnippets.map((snippet, index) => (
                    <div key={index} className="p-4 bg-glass border border-white/10 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {snippet.type === 'paragraph' && <FileText className="h-4 w-4 text-primary" />}
                          {snippet.type === 'list' && <List className="h-4 w-4 text-primary" />}
                          {snippet.type === 'table' && <Table className="h-4 w-4 text-primary" />}
                          <span className="font-medium capitalize">{snippet.type} Snippet</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => addFeaturedSnippet(snippet)}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add to Content
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {snippet.content.length > 150 
                          ? snippet.content.substring(0, 150) + '...' 
                          : snippet.content}
                      </div>
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">Source: </span>
                        <a href={snippet.source} target="_blank" rel="noreferrer" className="text-primary hover:underline">{snippet.source}</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-muted-foreground text-center">No featured snippets available</p>
              </div>
            )}
            
            {serpData.knowledgeGraph && (
              <div>
                <h4 className="text-sm font-medium mb-3">Knowledge Graph</h4>
                <div className="p-4 bg-glass border border-white/10 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{serpData.knowledgeGraph.title || mainKeyword}</span>
                    <Badge variant="outline">{serpData.knowledgeGraph.entityType || 'Entity'}</Badge>
                  </div>
                  {serpData.knowledgeGraph.description && (
                    <p className="text-sm text-muted-foreground mb-3">{serpData.knowledgeGraph.description}</p>
                  )}
                  {serpData.knowledgeGraph.attributes && (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(serpData.knowledgeGraph.attributes).map(([key, value], index) => (
                        <div key={index} className="text-sm">
                          <span className="text-muted-foreground">{key}: </span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="related">
          <div className="space-y-6">
            {serpData.relatedSearches && serpData.relatedSearches.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium mb-3">Related Searches</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {serpData.relatedSearches.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-2 bg-glass hover:bg-opacity-80 border border-white/10 rounded-md flex items-center justify-between cursor-pointer"
                      onClick={() => onAddToContent(item.query, 'relatedSearch')}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{item.query}</span>
                      </div>
                      {item.volume && (
                        <Badge variant="outline">{item.volume.toLocaleString()} m/o</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-muted-foreground text-center">No related searches available</p>
              </div>
            )}
            
            {serpData.imagePacks && serpData.imagePacks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Image Results</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {serpData.imagePacks.map((image, index) => (
                    <div key={index} className="relative aspect-video group rounded-md overflow-hidden">
                      <img 
                        src={image.thumbnailUrl} 
                        alt={image.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="text-white border border-white/30 hover:bg-white/20"
                          onClick={() => {
                            onAddToContent(`![${image.title}](${image.url})`, 'image');
                            toast.success('Image reference added to content');
                          }}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Image
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
