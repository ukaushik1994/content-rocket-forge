import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  Tag, 
  Heading, 
  Brain, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Newspaper, 
  Camera,
  Eye,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SerpSectionModal } from './SerpSectionModal';

interface SerpTilesOverviewProps {
  serpData: SerpAnalysisResult;
  mainKeyword: string;
  onSectionClick?: (sectionId: string) => void;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpTilesOverview: React.FC<SerpTilesOverviewProps> = ({
  serpData,
  mainKeyword,
  onSectionClick = () => {},
  onAddToContent = () => {}
}) => {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [modalSection, setModalSection] = useState<{
    id: string;
    title: string;
    description: string;
    count: number;
    data: any;
  } | null>(null);

  const sections = [
    {
      id: 'metrics',
      title: 'SEO Metrics',
      icon: BarChart3,
      description: 'Volume, competition, and opportunity analysis',
      count: 4,
      variant: 'blue' as const,
      gradient: 'from-primary/10 to-blue-600/10',
      iconColor: 'text-primary',
      borderColor: 'border-primary/30',
      bgColor: 'bg-primary/10',
      data: {
        searchVolume: serpData.searchVolume,
        keywordDifficulty: serpData.keywordDifficulty,
        competitionScore: serpData.competitionScore
      }
    },
    {
      id: 'keywords',
      title: 'Keywords',
      icon: Tag,
      description: 'Related keywords and search terms',
      count: serpData?.keywords?.length || 0,
      variant: 'purple' as const,
      gradient: 'from-secondary/10 to-accent/10',
      iconColor: 'text-secondary-foreground',
      borderColor: 'border-secondary/30',
      bgColor: 'bg-secondary/10',
      data: serpData.keywords?.slice(0, 3)
    },
    {
      id: 'content-gaps',
      title: 'Content Gaps',
      icon: Target,
      description: 'Opportunities competitors are missing',
      count: serpData?.contentGaps?.length || 0,
      variant: 'rose' as const,
      gradient: 'from-destructive/10 to-destructive/20',
      iconColor: 'text-destructive',
      borderColor: 'border-destructive/30',
      bgColor: 'bg-destructive/10',
      data: serpData.contentGaps?.slice(0, 2)
    },
    {
      id: 'questions',
      title: 'Questions',
      icon: HelpCircle,
      description: 'People also ask questions',
      count: serpData?.peopleAlsoAsk?.length || 0,
      variant: 'amber' as const,
      gradient: 'from-accent/10 to-accent/20',
      iconColor: 'text-accent-foreground',
      borderColor: 'border-accent/30',
      bgColor: 'bg-accent/10',
      data: serpData.peopleAlsoAsk?.slice(0, 3)
    },
    {
      id: 'featured-snippets',
      title: 'Featured Snippets',
      icon: Sparkles,
      description: 'Snippet optimization opportunities',
      count: serpData?.featuredSnippets?.length || 0,
      variant: 'green' as const,
      gradient: 'from-primary/10 to-primary/20',
      iconColor: 'text-primary',
      borderColor: 'border-primary/30',
      bgColor: 'bg-primary/10',
      data: serpData.featuredSnippets?.slice(0, 2)
    },
    {
      id: 'entities',
      title: 'Entities',
      icon: FileText,
      description: 'Key entities and concepts',
      count: serpData?.entities?.length || 0,
      variant: 'indigo' as const,
      gradient: 'from-secondary/10 to-secondary/20',
      iconColor: 'text-secondary-foreground',
      borderColor: 'border-secondary/30',
      bgColor: 'bg-secondary/10',
      data: serpData.entities?.slice(0, 4)
    },
    {
      id: 'headings',
      title: 'Headings',
      icon: Heading,
      description: 'Suggested content headings',
      count: serpData?.headings?.length || 0,
      variant: 'teal' as const,
      gradient: 'from-accent/10 to-accent/20',
      iconColor: 'text-accent-foreground',
      borderColor: 'border-accent/30',
      bgColor: 'bg-accent/10',
      data: serpData.headings?.slice(0, 3)
    },
    {
      id: 'top-stories',
      title: 'Top Stories',
      icon: Newspaper,
      description: 'Recent news and trending content',
      count: 3,
      variant: 'slate' as const,
      gradient: 'from-muted/10 to-muted/20',
      iconColor: 'text-muted-foreground',
      borderColor: 'border-muted/30',
      bgColor: 'bg-muted/10',
      data: ['Latest industry updates', 'Trending topics', 'Breaking news']
    }
  ].filter(section => section.count > 0);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderTilePreview = (section: any) => {
    if (section.id === 'metrics') {
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Search Volume:</span>
            <span className="font-medium">{section.data.searchVolume?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Difficulty:</span>
            <span className="font-medium">{section.data.keywordDifficulty || 'N/A'}%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Competition:</span>
            <span className="font-medium">
              {section.data.competitionScore ? `${(section.data.competitionScore * 100).toFixed(0)}%` : 'N/A'}
            </span>
          </div>
        </div>
      );
    }

    if (section.id === 'keywords' && section.data) {
      return (
        <div className="space-y-1">
          {section.data.map((keyword: any, index: number) => (
            <div key={index} className="text-xs text-muted-foreground truncate">
              • {typeof keyword === 'string' ? keyword : keyword.query || keyword.text}
            </div>
          ))}
        </div>
      );
    }

    if (section.id === 'content-gaps' && section.data) {
      return (
        <div className="space-y-1">
          {section.data.map((gap: any, index: number) => (
            <div key={index} className="text-xs text-muted-foreground truncate">
              • {gap.topic || gap.description}
            </div>
          ))}
        </div>
      );
    }

    if (section.id === 'questions' && section.data) {
      return (
        <div className="space-y-1">
          {section.data.map((question: any, index: number) => (
            <div key={index} className="text-xs text-muted-foreground truncate">
              • {question.question || question}
            </div>
          ))}
        </div>
      );
    }

    if (section.id === 'featured-snippets' && section.data) {
      return (
        <div className="space-y-1">
          {section.data.map((snippet: any, index: number) => (
            <div key={index} className="text-xs text-muted-foreground truncate">
              • {snippet.title || snippet.content?.substring(0, 40) + '...'}
            </div>
          ))}
        </div>
      );
    }

    if (section.id === 'entities' && section.data) {
      return (
        <div className="space-y-1">
          {section.data.map((entity: any, index: number) => (
            <div key={index} className="text-xs text-muted-foreground truncate">
              • {entity.name} {entity.type && `(${entity.type})`}
            </div>
          ))}
        </div>
      );
    }

    if (section.id === 'headings' && section.data) {
      return (
        <div className="space-y-1">
          {section.data.map((heading: any, index: number) => (
            <div key={index} className="text-xs text-muted-foreground truncate">
              • {heading.text}
            </div>
          ))}
        </div>
      );
    }

    if (section.id === 'top-stories' && Array.isArray(section.data)) {
      return (
        <div className="space-y-1">
          {section.data.map((story, index) => (
            <div key={index} className="text-xs text-muted-foreground truncate">
              • {story}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-xs text-muted-foreground italic">
        Click to explore {section.title.toLowerCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">SERP Analysis Overview</h3>
            <p className="text-sm text-muted-foreground">
              Keyword: <span className="text-primary font-medium">"{mainKeyword}"</span>
            </p>
          </div>
        </div>
        {serpData?.isMockData && (
          <Badge variant="outline" className="text-amber-400 border-amber-500/30">
            Demo Data
          </Badge>
        )}
      </div>

      {/* Tiles Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const isHovered = hoveredTile === section.id;

          return (
            <motion.div
              key={section.id}
              variants={item}
              onHoverStart={() => setHoveredTile(section.id)}
              onHoverEnd={() => setHoveredTile(null)}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card 
                className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300 group cursor-pointer h-full"
                onClick={() => onSectionClick(section.id)}
              >
                {/* Animated Background Gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  initial={false}
                />

                {/* Count Badge */}
                <motion.div
                  className="absolute top-3 right-3 z-10"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`${section.bgColor} ${section.iconColor} ${section.borderColor} font-bold`}>
                          {section.count}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="text-xs">{section.count} items found</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>

                <CardHeader className="relative pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.gradient} flex items-center justify-center border ${section.borderColor}`}>
                      <SectionIcon className={`h-4 w-4 ${section.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {section.description}
                  </p>
                </CardHeader>

                <CardContent className="relative pt-0">
                  {/* Content Preview */}
                  <div className="mb-4 min-h-[80px]">
                    {renderTilePreview(section)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalSection(section);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View All
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="text-xs">View all {section.title.toLowerCase()}</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${section.bgColor} hover:${section.bgColor.replace('/10', '/20')} ${section.borderColor} ${section.iconColor}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add all items from this section
                              if (section.data && Array.isArray(section.data)) {
                                section.data.forEach((item: any) => {
                                  const content = typeof item === 'string' ? item : 
                                    item.question || item.topic || item.text || item.name || item.title || JSON.stringify(item);
                                  onAddToContent(content, section.id);
                                });
                              }
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="text-xs">Add to selections</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  initial={false}
                />

                {/* Hover Arrow Indicator */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute bottom-3 right-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className={`h-4 w-4 ${section.iconColor}`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-primary">{sections.length}</div>
            <div className="text-xs text-muted-foreground">Active Sections</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {sections.reduce((sum, section) => sum + section.count, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {serpData.searchVolume?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Search Volume</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {serpData.keywordDifficulty || 'N/A'}%
            </div>
            <div className="text-xs text-muted-foreground">Difficulty</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SERP Section Modal */}
      {modalSection && (
        <SerpSectionModal
          isOpen={!!modalSection}
          onClose={() => setModalSection(null)}
          section={modalSection}
          serpData={serpData}
          onAddToContent={onAddToContent}
        />
      )}
    </div>
  );
};