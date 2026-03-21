import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, BarChart3, Layers, CheckCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface RepositoryHeroProps {
  onCreate?: () => void;
  stats?: {total: number;published: number;drafts: number;};
}

export const RepositoryHero = React.memo(({ onCreate, stats }: RepositoryHeroProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-16 relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }} />
      
      
      <div className="relative">
        














        
        
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}>
          
          Content
          <br />
          <span className="text-primary">Repository</span>
        </motion.h1>
        
        <motion.p
          className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}>
          
          Your unified content hub — blogs, socials, emails, video scripts, 
          and campaigns all in one powerful workspace
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}>
          
          <Button
            onClick={() => navigate('/ai-chat')}
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-semibold px-8 py-6 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            
            <FileText className="mr-2 h-5 w-5" />
            Create Content
          </Button>
        </motion.div>

        {/* Circular Stats */}
        {stats &&
        <motion.div
          className="flex justify-center gap-8 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}>
          
            {[
          { icon: FileText, value: stats.total, label: 'Total Content', color: 'text-blue-400' },
          { icon: CheckCircle, value: stats.published, label: 'Published', color: 'text-emerald-400' },
          { icon: Pencil, value: stats.drafts, label: 'Drafts', color: 'text-amber-400' }].
          map((stat) =>
          <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
          )}
          </motion.div>
        }

        {/* Feature Tags */}
        




















        
      </div>
    </div>);

});

RepositoryHero.displayName = "RepositoryHero";