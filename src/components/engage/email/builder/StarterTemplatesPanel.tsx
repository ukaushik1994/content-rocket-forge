import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Mail, Megaphone, PartyPopper, ShoppingBag, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailBlock, createBlock } from './blockDefinitions';

interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  gradient: string;
  buildBlocks: () => EmailBlock[];
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Onboard new subscribers with a warm welcome message',
    icon: UserPlus,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    buildBlocks: () => {
      const blocks: EmailBlock[] = [];
      let order = 0;
      const h = createBlock('header', order++);
      h.props = { ...h.props, text: 'Welcome to {{company_name}}!', backgroundColor: '#0f172a', textColor: '#ffffff', fontSize: 32 };
      blocks.push(h);
      const s = createBlock('spacer', order++);
      s.props.height = 16;
      blocks.push(s);
      const t = createBlock('text', order++);
      t.props = { ...t.props, content: '<p>Hi {{first_name}},</p><p>We\'re thrilled to have you on board! Here\'s what you can expect from us:</p><ul><li>Weekly insights and tips</li><li>Exclusive offers just for subscribers</li><li>Early access to new features</li></ul>' };
      blocks.push(t);
      const b = createBlock('button', order++);
      b.props = { ...b.props, text: 'Get Started →', backgroundColor: '#3b82f6', url: '#' };
      blocks.push(b);
      const d = createBlock('divider', order++);
      blocks.push(d);
      const f = createBlock('footer', order++);
      blocks.push(f);
      return blocks.map((bl, i) => ({ ...bl, order: i }));
    },
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Share updates, articles and news with your audience',
    icon: Mail,
    gradient: 'from-blue-500/20 to-indigo-500/20',
    buildBlocks: () => {
      const blocks: EmailBlock[] = [];
      let order = 0;
      const h = createBlock('header', order++);
      h.props = { ...h.props, text: 'Monthly Newsletter', backgroundColor: '#1e293b', textColor: '#ffffff' };
      blocks.push(h);
      const t1 = createBlock('text', order++);
      t1.props = { ...t1.props, content: '<p>Hi {{first_name}},</p><p>Here\'s what happened this month — our top stories, product updates, and community highlights.</p>' };
      blocks.push(t1);
      const img = createBlock('image', order++);
      img.props = { ...img.props, url: 'https://placehold.co/600x250/e2e8f0/475569?text=Featured+Article', alt: 'Featured Article' };
      blocks.push(img);
      const t2 = createBlock('text', order++);
      t2.props = { ...t2.props, content: '<h2 style="margin-bottom:8px;">Featured Story</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Discover the latest trends and insights that matter to you.</p>' };
      blocks.push(t2);
      const b = createBlock('button', order++);
      b.props = { ...b.props, text: 'Read More', backgroundColor: '#6366f1' };
      blocks.push(b);
      const d = createBlock('divider', order++);
      blocks.push(d);
      const cols = createBlock('columns', order++);
      cols.props = { ...cols.props, columns: [{ content: '<h3>Article 2</h3><p>Short summary of the second article...</p>' }, { content: '<h3>Article 3</h3><p>Short summary of the third article...</p>' }] };
      blocks.push(cols);
      const soc = createBlock('social', order++);
      blocks.push(soc);
      const f = createBlock('footer', order++);
      blocks.push(f);
      return blocks.map((bl, i) => ({ ...bl, order: i }));
    },
  },
  {
    id: 'promotion',
    name: 'Promotional',
    description: 'Drive sales with a compelling offer or discount',
    icon: ShoppingBag,
    gradient: 'from-orange-500/20 to-red-500/20',
    buildBlocks: () => {
      const blocks: EmailBlock[] = [];
      let order = 0;
      const h = createBlock('header', order++);
      h.props = { ...h.props, text: '🔥 Limited Time Offer!', backgroundColor: '#7c2d12', textColor: '#ffffff', fontSize: 32 };
      blocks.push(h);
      const t = createBlock('text', order++);
      t.props = { ...t.props, content: '<p style="font-size:18px;text-align:center;">Get <strong>30% OFF</strong> everything this week only!</p>', alignment: 'center', fontSize: 18 };
      blocks.push(t);
      const img = createBlock('image', order++);
      img.props = { ...img.props, url: 'https://placehold.co/600x300/fef3c7/92400e?text=SALE+30%25+OFF', alt: 'Sale Banner' };
      blocks.push(img);
      const b = createBlock('button', order++);
      b.props = { ...b.props, text: 'Shop Now', backgroundColor: '#dc2626', fontSize: 18, paddingY: 16, paddingX: 40 };
      blocks.push(b);
      const sp = createBlock('spacer', order++);
      sp.props.height = 8;
      blocks.push(sp);
      const t2 = createBlock('text', order++);
      t2.props = { ...t2.props, content: '<p style="text-align:center;color:#666;">Use code <strong>SAVE30</strong> at checkout. Offer expires Sunday.</p>', alignment: 'center' };
      blocks.push(t2);
      const d = createBlock('divider', order++);
      blocks.push(d);
      const f = createBlock('footer', order++);
      blocks.push(f);
      return blocks.map((bl, i) => ({ ...bl, order: i }));
    },
  },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Share important news or product launches',
    icon: Megaphone,
    gradient: 'from-purple-500/20 to-pink-500/20',
    buildBlocks: () => {
      const blocks: EmailBlock[] = [];
      let order = 0;
      const h = createBlock('header', order++);
      h.props = { ...h.props, text: 'Something Big is Coming', backgroundColor: '#581c87', textColor: '#ffffff', fontSize: 30 };
      blocks.push(h);
      const t = createBlock('text', order++);
      t.props = { ...t.props, content: '<p>Hi {{first_name}},</p><p>We\'ve been working hard behind the scenes, and we\'re excited to share our biggest update yet.</p>' };
      blocks.push(t);
      const vid = createBlock('video', order++);
      blocks.push(vid);
      const t2 = createBlock('text', order++);
      t2.props = { ...t2.props, content: '<h2>What\'s New</h2><p>Our latest release includes powerful new features designed to help you work smarter, not harder.</p>' };
      blocks.push(t2);
      const b = createBlock('button', order++);
      b.props = { ...b.props, text: 'Learn More', backgroundColor: '#9333ea' };
      blocks.push(b);
      const soc = createBlock('social', order++);
      blocks.push(soc);
      const f = createBlock('footer', order++);
      blocks.push(f);
      return blocks.map((bl, i) => ({ ...bl, order: i }));
    },
  },
  {
    id: 'event',
    name: 'Event Invitation',
    description: 'Invite contacts to your webinar, event or meetup',
    icon: PartyPopper,
    gradient: 'from-cyan-500/20 to-blue-500/20',
    buildBlocks: () => {
      const blocks: EmailBlock[] = [];
      let order = 0;
      const h = createBlock('header', order++);
      h.props = { ...h.props, text: "You're Invited!", backgroundColor: '#0c4a6e', textColor: '#ffffff', fontSize: 32 };
      blocks.push(h);
      const t = createBlock('text', order++);
      t.props = { ...t.props, content: '<p>Hi {{first_name}},</p><p>Join us for an exclusive event where we\'ll share insights, connect with industry leaders, and have a great time.</p>' };
      blocks.push(t);
      const cols = createBlock('columns', order++);
      cols.props = { ...cols.props, columns: [{ content: '<h3>📅 Date</h3><p>March 15, 2026</p>' }, { content: '<h3>📍 Location</h3><p>Virtual / Online</p>' }] };
      blocks.push(cols);
      const b = createBlock('button', order++);
      b.props = { ...b.props, text: 'RSVP Now', backgroundColor: '#0284c7', fontSize: 18 };
      blocks.push(b);
      const d = createBlock('divider', order++);
      blocks.push(d);
      const f = createBlock('footer', order++);
      blocks.push(f);
      return blocks.map((bl, i) => ({ ...bl, order: i }));
    },
  },
];

interface StarterTemplatesPanelProps {
  onSelect: (blocks: EmailBlock[], name: string) => void;
  onSkip: () => void;
}

export const StarterTemplatesPanel: React.FC<StarterTemplatesPanelProps> = ({ onSelect, onSkip }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-muted/10 flex flex-col items-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 max-w-lg"
      >
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Start with a Template</h2>
        <p className="text-sm text-muted-foreground">Choose a starter template to jumpstart your email, or start from scratch.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full mb-8">
        {STARTER_TEMPLATES.map((tpl, i) => (
          <motion.button
            key={tpl.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(tpl.buildBlocks(), tpl.name)}
            className="group text-left p-5 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tpl.gradient} flex items-center justify-center mb-3`}>
              <tpl.icon className="h-5 w-5 text-foreground/70" />
            </div>
            <h3 className="font-medium text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{tpl.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{tpl.description}</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Use template</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </motion.button>
        ))}
      </div>

      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onSkip}>
        Start from scratch →
      </Button>
    </div>
  );
};
