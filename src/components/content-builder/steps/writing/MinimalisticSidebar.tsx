import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  FileText, 
  BarChart3, 
  Lightbulb, 
  MessageSquare,
  X,
  ChevronRight
} from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { Solution } from '@/contexts/content-builder/types';

interface MinimalisticSidebarProps {
  content: string;
  serpSelections: SerpSelection[];
  outline: any[]; // Mixed array of strings and objects like in ContentWritingStep
  selectedSolution: Solution | null;
  additionalInstructions: string;
  onIntegrateItem?: (item: SerpSelection) => void;
  onInstructionsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function MinimalisticSidebar({
  content,
  serpSelections,
  outline,
  selectedSolution,
  additionalInstructions,
  onIntegrateItem,
  onInstructionsChange
}: MinimalisticSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate metrics
  const selectedSerpCount = serpSelections?.filter(item => item.selected).length || 0;
  const outlineCount = outline?.length || 0;
  const wordCount = content ? content.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  const hasInstructions = additionalInstructions && additionalInstructions.trim().length > 0;
  const hasSolution = selectedSolution !== null;

  const metrics = useMemo(() => [
    {
      id: 'serp',
      icon: Target,
      count: selectedSerpCount,
      label: 'SERP Items',
      color: selectedSerpCount > 0 ? 'text-emerald-400' : 'text-muted-foreground',
      bgColor: selectedSerpCount > 0 ? 'bg-emerald-500/20' : 'bg-muted/20'
    },
    {
      id: 'outline',
      icon: FileText,
      count: outlineCount,
      label: 'Outline Sections',
      color: outlineCount > 0 ? 'text-blue-400' : 'text-muted-foreground',
      bgColor: outlineCount > 0 ? 'bg-blue-500/20' : 'bg-muted/20'
    },
    {
      id: 'words',
      icon: BarChart3,
      count: wordCount,
      label: 'Words',
      color: wordCount > 0 ? 'text-purple-400' : 'text-muted-foreground',
      bgColor: wordCount > 0 ? 'bg-purple-500/20' : 'bg-muted/20'
    },
    {
      id: 'solution',
      icon: Lightbulb,
      count: hasSolution ? 1 : 0,
      label: 'Solution',
      color: hasSolution ? 'text-amber-400' : 'text-muted-foreground',
      bgColor: hasSolution ? 'bg-amber-500/20' : 'bg-muted/20'
    },
    {
      id: 'instructions',
      icon: MessageSquare,
      count: hasInstructions ? 1 : 0,
      label: 'Instructions',
      color: hasInstructions ? 'text-rose-400' : 'text-muted-foreground',
      bgColor: hasInstructions ? 'bg-rose-500/20' : 'bg-muted/20'
    }
  ], [selectedSerpCount, outlineCount, wordCount, hasSolution, hasInstructions]);

  const SerpPopoverContent = () => (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50" align="start">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-400" />
            SERP Integration
          </h3>
          <Badge variant="secondary" className="text-xs">
            {selectedSerpCount} selected
          </Badge>
        </div>
        <ScrollArea className="h-60">
          <div className="space-y-2">
            {serpSelections?.filter(item => item.selected).map((item, index) => (
              <motion.div
                key={index}
                className="p-3 rounded-lg bg-gradient-to-r from-background/60 to-muted/30 border border-border/30"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className="text-xs mb-2 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      {item.type.replace(/_/g, ' ')}
                    </Badge>
                    <p className="text-sm text-foreground line-clamp-3">{item.content}</p>
                  </div>
                  {onIntegrateItem && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onIntegrateItem(item)}
                      className="ml-2"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )) || (
              <p className="text-sm text-muted-foreground text-center py-8">
                No SERP items selected
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </PopoverContent>
  );

  const OutlinePopoverContent = () => (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50" align="start">
      <div className="p-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-blue-400" />
          Content Outline
        </h3>
        <ScrollArea className="h-60">
          {outlineCount > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Section</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outline.map((section, index) => (
                  <TableRow key={typeof section === 'object' && section?.id ? section.id : index}>
                    <TableCell className="font-medium text-xs">{index + 1}</TableCell>
                    <TableCell className="text-xs">
                      {typeof section === 'string' ? section : section?.title || 'Untitled Section'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No outline sections yet
            </p>
          )}
        </ScrollArea>
      </div>
    </PopoverContent>
  );

  const SolutionPopoverContent = () => (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50" align="start">
      <div className="p-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          Solution Reference
        </h3>
        {selectedSolution ? (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">{selectedSolution.name}</h4>
              <p className="text-xs text-muted-foreground">{selectedSolution.description}</p>
            </div>
            
            {selectedSolution.features.length > 0 && (
              <div>
                <h5 className="text-xs font-medium mb-2">Key Features</h5>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  {selectedSolution.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-muted-foreground">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedSolution.useCases.length > 0 && (
              <div>
                <h5 className="text-xs font-medium mb-2">Use Cases</h5>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  {selectedSolution.useCases.slice(0, 2).map((useCase, index) => (
                    <li key={index} className="text-muted-foreground">{useCase}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No solution selected</p>
        )}
      </div>
    </PopoverContent>
  );

  const InstructionsPopoverContent = () => (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50" align="start">
      <div className="p-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-rose-400" />
          Additional Instructions
        </h3>
        <Textarea
          placeholder="Add specific instructions for content generation..."
          className="resize-none h-32 text-sm"
          value={additionalInstructions}
          onChange={onInstructionsChange}
        />
      </div>
    </PopoverContent>
  );

  const WordsPopoverContent = () => (
    <PopoverContent className="w-64 p-4 bg-background/95 backdrop-blur-xl border-border/50" align="start">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
        <BarChart3 className="h-4 w-4 text-purple-400" />
        Word Count
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Current:</span>
          <span className="font-medium">{wordCount}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Target:</span>
          <span>1,500+</span>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((wordCount / 1500) * 100, 100)}%` }}
          />
        </div>
      </div>
    </PopoverContent>
  );

  return (
    <>
      {/* Floating Metrics Panel */}
      <motion.div 
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-2xl p-3 shadow-2xl">
          <div className="flex flex-col gap-3">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              
              const popoverContent = {
                serp: <SerpPopoverContent />,
                outline: <OutlinePopoverContent />,
                words: <WordsPopoverContent />,
                solution: <SolutionPopoverContent />,
                instructions: <InstructionsPopoverContent />
              }[metric.id];

              return (
                <Popover key={metric.id}>
                  <PopoverTrigger asChild>
                    <motion.button
                      className={`
                        relative p-3 rounded-xl ${metric.bgColor} 
                        border border-white/10 backdrop-blur-sm
                        hover:scale-105 active:scale-95 transition-all duration-200
                        group cursor-pointer
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={`h-4 w-4 ${metric.color} mb-1`} />
                      <div className={`text-xs font-mono font-bold ${metric.color}`}>
                        {metric.id === 'words' ? (wordCount > 999 ? '1k+' : metric.count) : metric.count}
                      </div>
                      
                      {/* Subtle glow for active metrics */}
                      {metric.count > 0 && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </motion.button>
                  </PopoverTrigger>
                  {popoverContent}
                </Popover>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}