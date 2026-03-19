import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, FileText, Search, Mail, Building2, Megaphone, ArrowRightLeft } from 'lucide-react';

interface CapabilityGroup {
  icon: React.ReactNode;
  title: string;
  actions: string[];
  examples: string[];
}

const GROUPS: CapabilityGroup[] = [
  {
    icon: <FileText className="h-3.5 w-3.5" />,
    title: 'Content',
    actions: ['Create, update, delete content', 'Generate full articles', 'Submit / approve / reject reviews'],
    examples: ['Create a blog post about AI trends', 'Generate a full article on cloud computing'],
  },
  {
    icon: <Search className="h-3.5 w-3.5" />,
    title: 'Keywords',
    actions: ['Add / remove keywords', 'SERP analysis', 'Topic clusters'],
    examples: ['Add keyword "machine learning"', 'Run SERP analysis for "SaaS tools"'],
  },
  {
    icon: <Mail className="h-3.5 w-3.5" />,
    title: 'Email & Contacts',
    actions: ['Create contacts & segments', 'Draft email campaigns', 'Send emails'],
    examples: ['Create a new email campaign', 'Send a quick email to test@example.com'],
  },
  {
    icon: <Building2 className="h-3.5 w-3.5" />,
    title: 'Offerings',
    actions: ['Create / update solutions', 'Add competitors', 'Competitor analysis'],
    examples: ['Add a new competitor', 'Analyze competitor strategies'],
  },
  {
    icon: <Megaphone className="h-3.5 w-3.5" />,
    title: 'Campaigns',
    actions: ['Trigger content generation', 'Retry failed items', 'Queue status'],
    examples: ['Run a campaign', 'Retry failed content generation'],
  },
  {
    icon: <ArrowRightLeft className="h-3.5 w-3.5" />,
    title: 'Cross-Module',
    actions: ['Promote content to campaign', 'Convert content to email', 'Repurpose for social'],
    examples: ['Promote this article to a campaign', 'Convert this blog to an email'],
  },
];

interface CapabilitiesCardProps {
  onTryExample?: (example: string) => void;
}

export const CapabilitiesCard: React.FC<CapabilitiesCardProps> = ({ onTryExample }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (i: number) => setExpandedIndex(prev => (prev === i ? null : i));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2 max-w-md"
    >
      <p className="text-[10px] uppercase tracking-widest text-primary/70 flex items-center gap-1.5 pl-1">
        <span className="w-1 h-1 rounded-full bg-primary/70" />
        I can help with
      </p>

      <div className="space-y-1">
        {GROUPS.map((group, i) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            {/* Row trigger */}
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md hover:bg-white/[0.08] transition-all duration-200 group"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06] text-foreground/70 shrink-0">
                {group.icon}
              </span>
              <span className="text-sm font-medium text-foreground/90 flex-1 text-left">{group.title}</span>
              <span className="text-[10px] text-muted-foreground/40 mr-1">
                {group.actions.length}
              </span>
              <motion.span
                animate={{ rotate: expandedIndex === i ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground/40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.span>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {expandedIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-1 pb-1 pl-12 pr-3 space-y-2">
                    {/* Actions */}
                    <div className="space-y-0.5">
                      {group.actions.map((action) => (
                        <button
                          key={action}
                          onClick={() => onTryExample?.(action)}
                          className="w-full text-left text-xs text-muted-foreground/70 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-foreground/90 transition-colors duration-150"
                        >
                          {action}
                        </button>
                      ))}
                    </div>

                    {/* Example pills */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {group.examples.map((ex) => (
                        <button
                          key={ex}
                          onClick={() => onTryExample?.(ex)}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-amber-300/20 text-amber-300/70 hover:bg-amber-300/10 hover:text-amber-200 transition-colors duration-150"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
