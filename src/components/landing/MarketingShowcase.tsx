import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mail, Share2, Zap, GitBranch, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const cards = [
  {
    icon: Mail,
    title: 'Email Campaigns',
    desc: 'Design, personalize, and send at scale. AI writes your subject lines and optimizes send times.',
    features: ['AI subject line optimization', 'Visual drag-and-drop builder'],
    stat: 'Avg 34% open rate',
  },
  {
    icon: Share2,
    title: 'Social Publishing',
    desc: 'Schedule and publish across all platforms from one dashboard with AI-generated captions.',
    features: ['Multi-platform scheduling', 'AI caption generation'],
    stat: '5+ platforms supported',
  },
  {
    icon: Zap,
    title: 'Automations',
    desc: 'Set triggers, build workflows, automate follow-ups. Your marketing runs while you sleep.',
    features: ['Visual workflow builder', 'Smart trigger conditions'],
    stat: 'Unlimited workflows',
  },
  {
    icon: GitBranch,
    title: 'Customer Journeys',
    desc: 'Visual journey builder. Guide contacts from awareness to conversion with personalized paths.',
    features: ['Drag-and-drop journey canvas', 'A/B path testing'],
    stat: 'Conversion optimized',
  },
];

export const MarketingShowcase = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" />
            Marketing Automation
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Marketing That{' '}
            <span className="bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
              Runs Itself
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Email, social, automations, and journeys — AI handles the execution so you focus on strategy.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-neon-pink/10 bg-white/[0.03] backdrop-blur-md p-6 hover:border-neon-pink/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="bg-neon-pink/10 rounded-xl p-3 w-fit mb-4">
                <card.icon className="h-6 w-6 text-neon-pink" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{card.desc}</p>
              <ul className="space-y-1.5 mb-4">
                {card.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-neon-pink/70 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <span className="text-xs text-neon-pink/60">{card.stat}</span>
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
            className="bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/90 hover:to-neon-purple/90 shadow-lg transition-all duration-300 group"
          >
            Launch Your First Campaign
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </Container>
    </section>
  );
};
