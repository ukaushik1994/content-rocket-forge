import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PenTool, Image, Video, Search, Target, ArrowRight, Sparkles, FileText, BookOpen } from 'lucide-react';

const features = [
  {
    icon: PenTool,
    title: 'AI Writer',
    desc: 'SERP-powered AI writing with competitor analysis built in. Your content always outranks.',
  },
  {
    icon: Image,
    title: 'Image Generation',
    desc: 'Generate stunning visuals with AI. Inpainting, variations, upscaling — all built in.',
  },
  {
    icon: Video,
    title: 'Video Generation',
    desc: 'Create videos from text prompts. Runway ML, Kling AI, and Replicate integrations.',
  },
  {
    icon: Search,
    title: 'Keyword Research',
    desc: 'Live SERP analysis, content gaps, People Also Ask mining — data-driven content.',
  },
  {
    icon: Target,
    title: 'Content Strategy',
    desc: 'AI Strategy Coach generates proposals, calendars, and competitive content plans.',
  },
];

export const ContentShowcase = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" />
            Content Creation Suite
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Content Creation,{' '}
            <span className="bg-gradient-to-r from-primary to-neon-purple bg-clip-text text-transparent">
              Supercharged
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered writing, image & video generation, SERP research, and strategic planning — all in one place.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — Feature cards */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-4 rounded-xl border border-primary/10 bg-white/[0.03] backdrop-blur-md hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="bg-primary/10 rounded-lg p-2.5 h-fit">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right — Mock UI */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-neon-purple/10 blur-3xl rounded-3xl" />
            <div className="relative rounded-2xl border border-primary/20 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
              {/* Editor header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">Content Builder</span>
              </div>

              {/* Editor body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary/60" />
                  <div className="h-6 rounded bg-primary/10 w-3/4" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-white/[0.06] w-full" />
                  <div className="h-3 rounded bg-white/[0.06] w-5/6" />
                  <div className="h-3 rounded bg-white/[0.06] w-4/6" />
                </div>

                {/* AI generated images row */}
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Image className="h-4 w-4 text-primary/60" />
                    <span className="text-xs text-muted-foreground">AI Generated</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-neon-blue/20 border border-primary/10 flex items-center justify-center">
                        <Image className="h-5 w-5 text-primary/30" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video thumbnail */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="h-4 w-4 text-primary/60" />
                    <span className="text-xs text-muted-foreground">Video Preview</span>
                  </div>
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-neon-purple/20 to-primary/20 border border-primary/10 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-primary ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
            className="bg-gradient-to-r from-primary to-neon-purple hover:from-primary/90 hover:to-neon-purple/90 shadow-lg hover:shadow-neon transition-all duration-300 group"
          >
            Start Creating Content
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </Container>
    </section>
  );
};
