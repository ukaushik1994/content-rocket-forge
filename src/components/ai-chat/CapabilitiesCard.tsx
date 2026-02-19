import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  FileText, Search, Mail, Building2, Megaphone, ArrowRightLeft,
} from 'lucide-react';

interface CapabilityGroup {
  icon: React.ReactNode;
  title: string;
  actions: string[];
  examples: string[];
}

const GROUPS: CapabilityGroup[] = [
  {
    icon: <FileText className="h-4 w-4" />,
    title: 'Content',
    actions: ['Create, update, delete content', 'Generate full articles', 'Submit / approve / reject reviews'],
    examples: ['Create a blog post about AI trends', 'Generate a full article on cloud computing'],
  },
  {
    icon: <Search className="h-4 w-4" />,
    title: 'Keywords',
    actions: ['Add / remove keywords', 'SERP analysis', 'Topic clusters'],
    examples: ['Add keyword "machine learning"', 'Run SERP analysis for "SaaS tools"'],
  },
  {
    icon: <Mail className="h-4 w-4" />,
    title: 'Email & Contacts',
    actions: ['Create contacts & segments', 'Draft email campaigns', 'Send emails'],
    examples: ['Create a new email campaign', 'Send a quick email to test@example.com'],
  },
  {
    icon: <Building2 className="h-4 w-4" />,
    title: 'Offerings',
    actions: ['Create / update solutions', 'Add competitors', 'Competitor analysis'],
    examples: ['Add a new competitor', 'Analyze competitor strategies'],
  },
  {
    icon: <Megaphone className="h-4 w-4" />,
    title: 'Campaigns',
    actions: ['Trigger content generation', 'Retry failed items', 'Queue status'],
    examples: ['Run a campaign', 'Retry failed content generation'],
  },
  {
    icon: <ArrowRightLeft className="h-4 w-4" />,
    title: 'Cross-Module',
    actions: ['Promote content to campaign', 'Convert content to email', 'Repurpose for social'],
    examples: ['Promote this article to a campaign', 'Convert this blog to an email'],
  },
];

interface CapabilitiesCardProps {
  onTryExample?: (example: string) => void;
}

export const CapabilitiesCard: React.FC<CapabilitiesCardProps> = ({ onTryExample }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <p className="text-sm text-muted-foreground">Here's everything I can do across your workspace:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {GROUPS.map((group) => (
          <Card key={group.title} className="p-3 bg-card/50 border-border/20 space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-primary">{group.icon}</div>
              <span className="text-xs font-semibold text-foreground">{group.title}</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {group.actions.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-1 pt-1">
              {group.examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => onTryExample?.(ex)}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};
