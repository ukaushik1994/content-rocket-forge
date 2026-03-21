import React from 'react';
import { motion } from 'framer-motion';
import { Layers, FileText, CheckCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface RepositoryHeroProps {
  onCreate?: () => void;
  stats?: { total: number; published: number; drafts: number };
}

export const RepositoryHero = React.memo(({ onCreate, stats }: RepositoryHeroProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center relative pt-12 pb-8">
      {/* Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] bg-violet-500/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
          <Layers className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-foreground/80">Content Hub</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-violet-400 to-purple-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}>
          Repository
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}>
          Your unified content hub — blogs, socials, emails, and campaigns in one workspace
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}>
          <Button
            onClick={() => navigate('/ai-chat')}
            className="bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 text-white font-semibold px-8 py-6 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <FileText className="mr-2 h-5 w-5" />
            Create Content
          </Button>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            className="flex justify-center gap-8 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}>
            {[
              { icon: FileText, value: stats.total, label: 'Total Content', color: 'text-violet-400' },
              { icon: CheckCircle, value: stats.published, label: 'Published', color: 'text-emerald-400' },
              { icon: Pencil, value: stats.drafts, label: 'Drafts', color: 'text-amber-400' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
});

RepositoryHero.displayName = 'RepositoryHero';
