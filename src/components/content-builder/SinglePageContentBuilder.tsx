
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Edit, BarChart4, ChevronDown, CheckCircle, Lock, Loader2, Eye, Settings, BarChart3 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Section 1 sub-components
import { KeywordSearch } from './keyword/KeywordSearch';
import { InlineSerpAnalysis } from './steps/keyword-analysis/InlineSerpAnalysis';
import { SerpAnalysisModal } from './steps/keyword-analysis/SerpAnalysisModal';
import { SelectionManagerModal } from './steps/keyword-analysis/SelectionManagerModal';
import { DataSourceIndicator } from './steps/keyword-analysis/DataSourceIndicator';
import { FloatingSelectionWindow } from './steps/keyword-analysis/FloatingSelectionWindow';
import { ContentTypeStep } from './steps/ContentTypeStep';
import { ContentBriefQuestions } from './steps/ContentBriefQuestions';

// Section 2 sub-components
import { ContentOutlineSection } from './outline/ContentOutlineSection';
import { ContentWritingStep } from './steps/ContentWritingStep';

// Section 3 sub-components
import { OptimizeAndReviewStep } from './steps/OptimizeAndReviewStep';

type SectionId = 'research' | 'write' | 'review';

interface SectionConfig {
  id: SectionId;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const SECTIONS: SectionConfig[] = [
  { id: 'research', title: 'Research & Setup', icon: <Search className="h-5 w-5" />, description: 'Keyword analysis, SERP intelligence & content configuration' },
  { id: 'write', title: 'Outline & Write', icon: <Edit className="h-5 w-5" />, description: 'Generate outline and write your content' },
  { id: 'review', title: 'Review & Save', icon: <BarChart4 className="h-5 w-5" />, description: 'SEO optimization, meta tags & publishing' },
];

export const SinglePageContentBuilder: React.FC = () => {
  const { state, dispatch, analyzeKeyword, addSerpSelections, generateOutlineFromSelections } = useContentBuilder();
  const { mainKeyword, selectedKeywords, serpData, serpSelections, isAnalyzing, content, contentType, outline, selectedSolution } = state;

  const [activeSection, setActiveSection] = useState<SectionId>('research');
  const [hasSearched, setHasSearched] = useState(!!mainKeyword);
  const [showSerpAnalysisModal, setShowSerpAnalysisModal] = useState(false);
  const [showSelectionManagerModal, setShowSelectionManagerModal] = useState(false);

  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({ research: null, write: null, review: null });

  // Determine section states
  const sectionStates = useMemo(() => {
    const researchDone = !!(mainKeyword && selectedKeywords.length > 0 && contentType);
    const writeDone = !!(content && content.length > 200);
    const reviewDone = !!(state.metaTitle && state.metaDescription);

    return {
      research: { completed: researchDone, locked: false },
      write: { completed: writeDone, locked: !researchDone },
      review: { completed: reviewDone, locked: !writeDone },
    };
  }, [mainKeyword, selectedKeywords, contentType, content, state.metaTitle, state.metaDescription]);

  // Auto-expand next section
  useEffect(() => {
    if (sectionStates.research.completed && activeSection === 'research') {
      setActiveSection('write');
      setTimeout(() => sectionRefs.current.write?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [sectionStates.research.completed]);

  useEffect(() => {
    if (sectionStates.write.completed && activeSection === 'write') {
      setActiveSection('review');
      setTimeout(() => sectionRefs.current.review?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [sectionStates.write.completed]);

  // SERP search handler
  const handleKeywordSearch = async (keyword: string, searchSuggestions: string[]) => {
    dispatch({ type: 'SET_MAIN_KEYWORD', payload: keyword });
    if (!selectedKeywords.includes(keyword)) {
      dispatch({ type: 'ADD_KEYWORD', payload: keyword });
    }
    setHasSearched(true);
    await analyzeKeyword(keyword);
  };

  // Step completion dispatches (preserve compatibility)
  useEffect(() => {
    if (mainKeyword && selectedKeywords.length > 0) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 0 });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    }
  }, [mainKeyword, selectedKeywords, dispatch]);

  useEffect(() => {
    if (contentType && outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    }
  }, [contentType, outline, dispatch]);

  const selectedCount = serpSelections.filter(item => item.selected).length;
  const completedCount = Object.values(sectionStates).filter(s => s.completed).length;

  const handleSectionToggle = (id: SectionId) => {
    if (sectionStates[id].locked) return;
    setActiveSection(prev => prev === id ? id : id);
  };

  // Summary text for collapsed sections
  const getSummaryText = (id: SectionId): string => {
    switch (id) {
      case 'research':
        if (!sectionStates.research.completed) return '';
        return `"${mainKeyword}" · ${contentType || 'Blog Post'} · ${selectedCount} SERP items`;
      case 'write':
        if (!sectionStates.write.completed) return '';
        const wordCount = content?.split(/\s+/).filter(Boolean).length || 0;
        return `${outline.length} sections · ${wordCount.toLocaleString()} words`;
      case 'review':
        if (!sectionStates.review.completed) return '';
        return `SEO Score: ${state.seoScore || 0}% · Saved`;
      default:
        return '';
    }
  };

  const getStatusBadge = (id: SectionId) => {
    const s = sectionStates[id];
    if (s.locked) return <Badge variant="secondary" className="bg-muted/50 text-muted-foreground text-xs gap-1"><Lock className="h-3 w-3" /> Locked</Badge>;
    if (s.completed) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs gap-1"><CheckCircle className="h-3 w-3" /> Complete</Badge>;
    if (activeSection === id) return <Badge className="bg-primary/20 text-primary border-primary/30 text-xs gap-1"><Sparkles className="h-3 w-3" /> Active</Badge>;
    return null;
  };

  return (
    <div className="relative min-h-[calc(100vh-theme(spacing.20))]">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2], x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -200, 0], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 4 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 8, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Compact Header with Progress Dots */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Content Builder</span>
            <div className="flex items-center gap-2 ml-2">
              {SECTIONS.map((section, idx) => (
                <React.Fragment key={section.id}>
                  <motion.div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-500",
                      sectionStates[section.id].completed
                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                        : activeSection === section.id
                        ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                        : "bg-muted-foreground/30"
                    )}
                    animate={activeSection === section.id ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  {idx < SECTIONS.length - 1 && (
                    <div className={cn(
                      "w-6 h-px transition-colors duration-500",
                      sectionStates[section.id].completed ? "bg-green-500/50" : "bg-border/30"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              Step {SECTIONS.findIndex(s => s.id === activeSection) + 1} of 3
            </span>
          </div>
        </motion.div>

        {/* Collapsible Sections */}
        {SECTIONS.map((section, index) => {
          const isActive = activeSection === section.id;
          const isLocked = sectionStates[section.id].locked;
          const isCompleted = sectionStates[section.id].completed;
          const summary = getSummaryText(section.id);

          return (
            <motion.div
              key={section.id}
              ref={el => { sectionRefs.current[section.id] = el; }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Collapsible open={isActive} onOpenChange={() => handleSectionToggle(section.id)}>
                <CollapsibleTrigger asChild>
                  <motion.div
                    className={cn(
                      "w-full cursor-pointer rounded-2xl border transition-all duration-500 group",
                      isActive
                        ? "bg-background/60 backdrop-blur-xl border-primary/40 shadow-lg shadow-primary/10 border-l-4 border-l-primary"
                        : isCompleted
                        ? "bg-background/40 backdrop-blur-xl border-green-500/20 hover:border-green-500/40 hover:bg-background/50"
                        : isLocked
                        ? "bg-background/20 backdrop-blur-sm border-border/20 opacity-50 cursor-not-allowed"
                        : "bg-background/40 backdrop-blur-xl border-border/30 hover:border-border/50 hover:bg-background/50"
                    )}
                    whileHover={!isLocked ? { scale: 1.005 } : {}}
                    whileTap={!isLocked ? { scale: 0.995 } : {}}
                  >
                    <div className="flex items-center gap-4 px-6 py-5">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : isCompleted
                          ? "bg-green-500/20 text-green-400"
                          : "bg-muted/50 text-muted-foreground"
                      )}>
                        {isCompleted && !isActive ? <CheckCircle className="h-5 w-5" /> : section.icon}
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <h3 className={cn(
                          "text-base font-semibold transition-colors",
                          isActive ? "text-foreground" : "text-foreground/80"
                        )}>
                          {section.title}
                        </h3>
                        {isActive ? (
                          <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
                        ) : summary ? (
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">{summary}</p>
                        ) : isLocked ? (
                          <p className="text-sm text-muted-foreground/60 mt-0.5">Complete previous step to unlock</p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(section.id)}
                        <motion.div
                          animate={{ rotate: isActive ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground/50")} />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="px-6 pb-6 pt-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      >
                        {section.id === 'research' && (
                          <ResearchSection
                            mainKeyword={mainKeyword}
                            serpData={serpData}
                            isAnalyzing={isAnalyzing}
                            hasSearched={hasSearched}
                            selectedCount={selectedCount}
                            onKeywordSearch={handleKeywordSearch}
                            onShowSerpModal={() => setShowSerpAnalysisModal(true)}
                            onShowSelectionManager={() => setShowSelectionManagerModal(true)}
                          />
                        )}
                        {section.id === 'write' && (
                          <div className="space-y-6">
                            <ContentOutlineSection />
                            <ContentWritingStep />
                          </div>
                        )}
                        {section.id === 'review' && (
                          <OptimizeAndReviewStep />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}
      </div>

      {/* Modals */}
      <SerpAnalysisModal
        isOpen={showSerpAnalysisModal}
        onClose={() => setShowSerpAnalysisModal(false)}
        serpData={serpData}
        serpSelections={serpSelections}
        onToggleSelection={(type, content) => dispatch({ type: 'TOGGLE_SERP_SELECTION', payload: { id: `${type}-${Date.now()}`, type, content } })}
        keyword={mainKeyword}
      />
      <SelectionManagerModal
        isOpen={showSelectionManagerModal}
        onClose={() => setShowSelectionManagerModal(false)}
        serpSelections={serpSelections}
        onToggleSelection={(type, content) => dispatch({ type: 'TOGGLE_SERP_SELECTION', payload: { id: `${type}-${Date.now()}`, type, content } })}
        onClearAll={() => {
          serpSelections.filter(item => item.selected).forEach(item => {
            dispatch({ type: 'TOGGLE_SERP_SELECTION', payload: { id: `${item.type}-${Date.now()}`, type: item.type, content: item.content } });
          });
        }}
        onGenerateOutline={async () => { await generateOutlineFromSelections(); }}
      />
    </div>
  );
};

// ─── Research Section Inner Component ───────────────────────────────────────

interface ResearchSectionProps {
  mainKeyword: string;
  serpData: any;
  isAnalyzing: boolean;
  hasSearched: boolean;
  selectedCount: number;
  onKeywordSearch: (keyword: string, suggestions: string[]) => void;
  onShowSerpModal: () => void;
  onShowSelectionManager: () => void;
}

const ResearchSection: React.FC<ResearchSectionProps> = ({
  mainKeyword, serpData, isAnalyzing, hasSearched, selectedCount,
  onKeywordSearch, onShowSerpModal, onShowSelectionManager
}) => {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl blur-xl opacity-60" />
        <div className="relative bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 p-4 shadow-lg">
          <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={onKeywordSearch} />
        </div>
      </motion.div>

      {/* SERP Results */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            key="analyzing"
            className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="h-10 w-10 text-primary mx-auto" />
            </motion.div>
            <h3 className="text-lg font-semibold mt-4 text-foreground">Analyzing SERP Intelligence</h3>
            <p className="text-sm text-muted-foreground mt-2">Extracting competitor insights and content gaps...</p>
          </motion.div>
        )}

        {!isAnalyzing && serpData && (
          <motion.div
            key="results"
            className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">SERP Intelligence</h3>
                    <p className="text-sm text-muted-foreground">Analysis for "{mainKeyword}"</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onShowSerpModal} className="bg-background/60 hover:bg-background/80 border-border/50">
                    <Eye className="h-4 w-4 mr-2" /> Explore Data
                  </Button>
                  {selectedCount > 0 && (
                    <Button size="sm" onClick={onShowSelectionManager} className="bg-primary hover:bg-primary/90">
                      <Settings className="h-4 w-4 mr-2" /> Manage ({selectedCount})
                    </Button>
                  )}
                </div>
              </div>
              <DataSourceIndicator isRealData={serpData?.isGoogleData} isMockData={serpData?.isMockData} className="mb-4" />
              <InlineSerpAnalysis serpData={serpData} keyword={mainKeyword} />
            </div>
          </motion.div>
        )}

        {!isAnalyzing && !serpData && hasSearched && (
          <motion.div
            key="no-data"
            className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No SERP data available. Try another keyword.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Type & Brief */}
      {hasSearched && !isAnalyzing && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6">
            <ContentTypeStep />
          </div>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
                <Settings className="h-4 w-4" /> Customize Brief
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                className="mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ContentBriefQuestions />
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>
      )}
    </div>
  );
};

export default SinglePageContentBuilder;
