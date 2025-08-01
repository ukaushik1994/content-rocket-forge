import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { CheckCircle, Eye, ArrowRight, Settings, Sparkles, HelpCircle, Heading, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface SelectionSummaryCardProps {
  serpSelections: SerpSelection[];
  onOpenSelectionManager: () => void;
  onGenerateOutline: () => void;
  isGenerating?: boolean;
}
export function SelectionSummaryCard({
  serpSelections,
  onOpenSelectionManager,
  onGenerateOutline,
  isGenerating = false
}: SelectionSummaryCardProps) {
  const selectedItems = serpSelections.filter(item => item.selected);
  const totalSelected = selectedItems.length;

  // Group selected items by type
  const groupedItems = {
    faq: selectedItems.filter(item => item.type === 'peopleAlsoAsk' || item.type === 'question'),
    headings: selectedItems.filter(item => item.type === 'heading'),
    keywords: selectedItems.filter(item => item.type === 'keyword' || item.type === 'relatedSearch'),
    other: selectedItems.filter(item => !['peopleAlsoAsk', 'question', 'heading', 'keyword', 'relatedSearch'].includes(item.type))
  };
  const typeConfig = {
    faq: {
      label: 'FAQ Questions',
      icon: HelpCircle,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30'
    },
    headings: {
      label: 'SERP Headings',
      icon: Heading,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30'
    },
    keywords: {
      label: 'Keywords',
      icon: Tag,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30'
    }
  };
  return <Card className="sticky top-4 card-glass border-white/20 backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-indigo-900/70 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-cyan-500/10 animate-gradient-shift bg-300% rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg" />
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="relative">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <div className="absolute inset-0 h-5 w-5 text-emerald-400 animate-pulse-glow opacity-50" />
          </div>
          <span className="text-holographic font-semibold">Selected Content</span>
          {totalSelected > 0 && <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-400/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              {totalSelected} items
            </Badge>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-5 relative z-10">
        {totalSelected === 0 ? <motion.div className="text-center py-8" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
            <div className="relative mb-4">
              <Eye className="h-12 w-12 text-slate-400 mx-auto" />
              <div className="absolute inset-0 h-12 w-12 text-slate-400 mx-auto animate-pulse opacity-30" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              No items selected yet.<br />
              Choose content from SERP analysis to begin.
            </p>
          </motion.div> : <motion.div className="space-y-4" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.5
      }}>
            {/* FAQ Questions Section */}
            <AnimatePresence>
              {groupedItems.faq.length > 0 && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${typeConfig.faq.color} bg-opacity-20`}>
                      <typeConfig.faq.icon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-sm font-medium text-white">{typeConfig.faq.label}</h4>
                    <Badge className={`text-xs bg-gradient-to-r ${typeConfig.faq.bgColor} text-purple-300 ${typeConfig.faq.borderColor}`}>
                      {groupedItems.faq.length}
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {groupedItems.faq.map((item, index) => <motion.div key={`faq-${index}`} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: index * 0.1
              }} className={`p-3 rounded-lg bg-gradient-to-r ${typeConfig.faq.bgColor} border ${typeConfig.faq.borderColor} backdrop-blur-sm`}>
                        <p className="text-xs text-white leading-relaxed">{item.content}</p>
                      </motion.div>)}
                  </div>
                </motion.div>}
            </AnimatePresence>

            {/* SERP Headings Section */}
            <AnimatePresence>
              {groupedItems.headings.length > 0 && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${typeConfig.headings.color} bg-opacity-20`}>
                      <typeConfig.headings.icon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-sm font-medium text-white">{typeConfig.headings.label}</h4>
                    <Badge className={`text-xs bg-gradient-to-r ${typeConfig.headings.bgColor} text-green-300 ${typeConfig.headings.borderColor}`}>
                      {groupedItems.headings.length}
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {groupedItems.headings.map((item, index) => <motion.div key={`heading-${index}`} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: index * 0.1
              }} className={`p-3 rounded-lg bg-gradient-to-r ${typeConfig.headings.bgColor} border ${typeConfig.headings.borderColor} backdrop-blur-sm`}>
                        <p className="text-xs text-white leading-relaxed">{item.content}</p>
                      </motion.div>)}
                  </div>
                </motion.div>}
            </AnimatePresence>

            {/* Keywords Section */}
            <AnimatePresence>
              {groupedItems.keywords.length > 0 && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${typeConfig.keywords.color} bg-opacity-20`}>
                      <typeConfig.keywords.icon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-sm font-medium text-white">{typeConfig.keywords.label}</h4>
                    <Badge className={`text-xs bg-gradient-to-r ${typeConfig.keywords.bgColor} text-blue-300 ${typeConfig.keywords.borderColor}`}>
                      {groupedItems.keywords.length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {groupedItems.keywords.map((item, index) => <motion.div key={`keyword-${index}`} initial={{
                opacity: 0,
                scale: 0.8
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                delay: index * 0.05
              }}>
                        <Badge className={`bg-gradient-to-r ${typeConfig.keywords.bgColor} text-blue-300 ${typeConfig.keywords.borderColor} backdrop-blur-sm`}>
                          {item.content}
                        </Badge>
                      </motion.div>)}
                  </div>
                </motion.div>}
            </AnimatePresence>
          </motion.div>}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          
          
          {totalSelected > 0}
        </div>

        {totalSelected > 0 && <motion.div className="text-xs text-slate-300 p-3 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg border border-blue-500/20 backdrop-blur-sm" initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
            <div className="flex items-start gap-2">
              <Sparkles className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">
                Selected content will be integrated by AI to create your content outline and generate comprehensive, SEO-optimized content.
              </span>
            </div>
          </motion.div>}
      </CardContent>
    </Card>;
}