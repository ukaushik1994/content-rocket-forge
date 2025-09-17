import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Target,
  FileText,
  Settings,
  Info
} from 'lucide-react';
import { ContentHighlight, HighlightAnalysisResult } from '@/services/contentHighlightingService';
import { ComplianceAnalysisResult } from '@/types/contentCompliance';
import { motion, AnimatePresence } from 'framer-motion';

interface ComplianceHighlightedViewerProps {
  content: string;
  highlightResult: HighlightAnalysisResult;
  complianceResult: ComplianceAnalysisResult;
  className?: string;
  onHighlightSelect?: (highlightIds: string[]) => void;
}

export const ComplianceHighlightedViewer: React.FC<ComplianceHighlightedViewerProps> = ({
  content,
  highlightResult,
  complianceResult,
  className = "",
  onHighlightSelect
}) => {
  const [showHighlights, setShowHighlights] = useState(true);
  const [selectedHighlights, setSelectedHighlights] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'non-compliant' | 'partially-compliant' | 'compliant'>('all');

  const filteredHighlights = useMemo(() => {
    if (filterType === 'all') return highlightResult.highlights;
    return highlightResult.highlights.filter(h => h.complianceStatus === filterType);
  }, [highlightResult.highlights, filterType]);

  const getHighlightColor = (highlight: ContentHighlight) => {
    const baseColors = {
      'compliant': 'bg-green-100 border-green-300 text-green-800',
      'partially-compliant': 'bg-yellow-100 border-yellow-300 text-yellow-800', 
      'non-compliant': 'bg-red-100 border-red-300 text-red-800'
    };

    const status = highlight.complianceStatus || 'non-compliant';
    return `${baseColors[status]} hover:opacity-80 transition-all duration-200`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      case 'partially-compliant': return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case 'non-compliant': return <XCircle className="w-3 h-3 text-red-600" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'keyword': return <Target className="w-3 h-3" />;
      case 'structure': return <FileText className="w-3 h-3" />;
      case 'solution': return <Settings className="w-3 h-3" />;
      case 'serp': return <Info className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  const handleHighlightClick = (highlightId: string) => {
    const newSelected = new Set(selectedHighlights);
    if (newSelected.has(highlightId)) {
      newSelected.delete(highlightId);
    } else {
      newSelected.add(highlightId);
    }
    setSelectedHighlights(newSelected);
    onHighlightSelect?.(Array.from(newSelected));
  };

  const renderHighlightedContent = () => {
    if (!showHighlights || filteredHighlights.length === 0) {
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
    }

    let lastIndex = 0;
    const elements: JSX.Element[] = [];
    const sortedHighlights = [...filteredHighlights].sort((a, b) => a.startIndex - b.startIndex);

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.startIndex > lastIndex) {
        const textBefore = content.substring(lastIndex, highlight.startIndex);
        if (textBefore) {
          elements.push(
            <span key={`text-${index}-before`} dangerouslySetInnerHTML={{ __html: textBefore }} />
          );
        }
      }

      // Add highlighted text
      const isSelected = selectedHighlights.has(highlight.id);
      elements.push(
        <TooltipProvider key={`highlight-${highlight.id}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`
                  inline-block px-2 py-1 rounded-sm border cursor-pointer transition-all duration-200
                  ${getHighlightColor(highlight)}
                  ${isSelected ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:scale-102'}
                `}
                onClick={() => handleHighlightClick(highlight.id)}
              >
                {highlight.text}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(highlight.complianceStatus || 'non-compliant')}
                  {getCategoryIcon(highlight.complianceCategory)}
                  <span className="font-medium text-sm">{highlight.suggestion.title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={highlight.complianceStatus === 'compliant' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {highlight.complianceStatus?.replace('-', ' ') || 'needs review'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {highlight.priority}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {highlight.suggestion.description}
                </p>

                <div className="text-xs text-muted-foreground border-t pt-2">
                  Category: {highlight.complianceCategory || 'general'}
                  {highlight.violationId && (
                    <div className="mt-1">ID: {highlight.violationId}</div>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = highlight.endIndex;
    });

    // Add remaining text after last highlight
    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex);
      if (textAfter) {
        elements.push(
          <span key="text-after" dangerouslySetInnerHTML={{ __html: textAfter }} />
        );
      }
    }

    return (
      <div className="prose max-w-none">
        {elements}
      </div>
    );
  };

  const complianceCounts = useMemo(() => {
    const counts = {
      compliant: 0,
      'partially-compliant': 0,
      'non-compliant': 0
    };
    
    highlightResult.highlights.forEach(highlight => {
      const status = highlight.complianceStatus || 'non-compliant';
      counts[status]++;
    });
    
    return counts;
  }, [highlightResult.highlights]);

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowHighlights(!showHighlights)}
          className="gap-2"
        >
          {showHighlights ? (
            <>
              <EyeOff className="w-3 h-3" />
              Hide Highlights
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Show Compliance Highlights
            </>
          )}
        </Button>

        {showHighlights && (
          <>
            <div className="flex items-center gap-1">
              {(['all', 'non-compliant', 'partially-compliant', 'compliant'] as const).map(type => (
                <Button
                  key={type}
                  size="sm"
                  variant={filterType === type ? "default" : "outline"}
                  onClick={() => setFilterType(type)}
                  className="text-xs"
                >
                  {type === 'all' ? 'All' : type.replace('-', ' ')}
                  {type !== 'all' && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {complianceCounts[type]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {selectedHighlights.size > 0 && (
              <Badge variant="outline">
                {selectedHighlights.size} selected
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Content with highlights */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${showHighlights}-${filterType}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderHighlightedContent()}
        </motion.div>
      </AnimatePresence>

      {/* Compliance Summary */}
      {showHighlights && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-6"
        >
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Compliance Analysis Summary</span>
                <Badge variant="outline">
                  {Math.round(complianceResult.overall.score)}% Overall
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span>Compliant</span>
                  </div>
                  <div className="text-xl font-semibold text-green-600">
                    {complianceCounts.compliant}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-600" />
                    <span>Partial</span>
                  </div>
                  <div className="text-xl font-semibold text-yellow-600">
                    {complianceCounts['partially-compliant']}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <span>Issues</span>
                  </div>
                  <div className="text-xl font-semibold text-red-600">
                    {complianceCounts['non-compliant']}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-muted-foreground">Total Violations</div>
                  <div className="text-xl font-semibold">
                    {complianceResult.violations.length}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Click highlights to select areas for automated fixing. Green areas show compliant content, 
                yellow areas need minor improvements, and red areas require immediate attention.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};