import React from 'react';
import { motion } from 'framer-motion';
import {
  PenTool, Image, Mail, Calendar, Users, BarChart3, Brain, Search
} from 'lucide-react';

const tools = [
  { label: 'Writer', icon: PenTool, color: 'text-primary' },
  { label: 'Image Gen', icon: Image, color: 'text-neon-pink' },
  { label: 'Email Builder', icon: Mail, color: 'text-neon-pink' },
  { label: 'Social Calendar', icon: Calendar, color: 'text-neon-blue' },
  { label: 'CRM', icon: Users, color: 'text-neon-blue' },
  { label: 'Analytics', icon: BarChart3, color: 'text-neon-orange' },
  { label: 'Strategy Coach', icon: Brain, color: 'text-primary' },
  { label: 'Keyword Research', icon: Search, color: 'text-neon-orange' },
];

export const ManualToolsStrip: React.FC = () => (
  <section className="py-20 md:py-28 px-4">
    <div className="max-w-6xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Or take full control.
        </h3>
        <p className="text-muted-foreground text-lg mb-12">
          Every tool is also available manually — always at your fingertips.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="flex flex-col items-center gap-2.5"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300">
              <tool.icon className={`h-6 w-6 ${tool.color}`} />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{tool.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
