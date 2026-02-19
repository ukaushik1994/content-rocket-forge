import React from 'react';
import { motion } from 'framer-motion';
import {
  PenTool, Image, Mail, Calendar, Users, BarChart3, Brain, Search
} from 'lucide-react';

const tools = [
  { label: 'AI Writer', icon: PenTool },
  { label: 'Image Gen', icon: Image },
  { label: 'Email Builder', icon: Mail },
  { label: 'Social Calendar', icon: Calendar },
  { label: 'CRM', icon: Users },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Strategy Coach', icon: Brain },
  { label: 'Keyword Research', icon: Search },
];

export const ManualToolsStrip: React.FC = () => (
  <section className="py-20 md:py-28 px-4">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
          Or take full control
        </p>
        <h3 className="text-xl md:text-2xl font-semibold text-foreground/80 mb-14">
          Every tool is also available manually.
        </h3>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-8 md:gap-10">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="flex flex-col items-center gap-2.5 group cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center transition-all duration-300 group-hover:bg-white/[0.06] group-hover:border-white/[0.1] group-hover:scale-105">
              <tool.icon className="h-5 w-5 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
            </div>
            <span className="text-[11px] text-muted-foreground/40 font-medium tracking-wide group-hover:text-muted-foreground/60 transition-colors">{tool.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
