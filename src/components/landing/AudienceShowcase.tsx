import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Layers, Activity, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const cards = [
  {
    icon: Users,
    title: 'Contacts CRM',
    desc: 'Unified contact profiles with engagement history, scoring, and lifecycle tracking.',
    features: ['Engagement scoring', 'Custom fields & tags', 'Import/export'],
    stat: '360° contact view',
  },
  {
    icon: Layers,
    title: 'Smart Segments',
    desc: 'Rule-based and AI-powered audience segmentation for precision targeting.',
    features: ['Dynamic rule builder', 'AI-suggested segments', 'Real-time sync'],
    stat: 'Unlimited segments',
  },
  {
    icon: Activity,
    title: 'Activity Feed',
    desc: 'Real-time timeline of every interaction across email, social, and content channels.',
    features: ['Cross-channel tracking', 'Event filtering', 'Engagement alerts'],
    stat: 'Real-time updates',
  },
];

export const AudienceShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" />
            Audience Intelligence
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Know Your Audience{' '}
            <span className="bg-gradient-to-r from-neon-blue to-primary bg-clip-text text-transparent">
              Inside Out
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unified contacts, smart segments, and real-time activity — understand and engage your audience like never before.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-neon-blue/10 bg-white/[0.03] backdrop-blur-md p-6 hover:border-neon-blue/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="bg-neon-blue/10 rounded-xl p-3 w-fit mb-4">
                <card.icon className="h-6 w-6 text-neon-blue" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{card.desc}</p>
              <ul className="space-y-1.5 mb-4">
                {card.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-neon-blue/70 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <span className="text-xs text-neon-blue/60">{card.stat}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-gradient-to-r from-neon-blue to-primary hover:from-neon-blue/90 hover:to-primary/90 shadow-lg transition-all duration-300 group"
          >
            Understand Your Audience
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </Container>
    </section>
  );
};
