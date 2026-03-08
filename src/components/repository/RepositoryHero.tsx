import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, BarChart3, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface RepositoryHeroProps {
  onCreate?: () => void;
}

export const RepositoryHero = React.memo(({ onCreate }: RepositoryHeroProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-16 relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <div className="relative">
        <motion.div 
          className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
          <span className="text-sm font-medium">Content Management Hub</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Content
          <br />
          <span className="text-primary">Repository</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Your unified content hub — blogs, socials, emails, video scripts, 
          and campaigns all in one powerful workspace
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Button 
            onClick={() => navigate('/ai-chat')}
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-semibold px-8 py-6 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <FileText className="mr-2 h-5 w-5" />
            Create Content
          </Button>
        </motion.div>

        {/* Feature Tags */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {[
            { icon: FileText, label: "Content Types", color: "from-blue-500/20 to-purple-500/20" },
            { icon: BarChart3, label: "AI Analysis", color: "from-green-500/20 to-emerald-500/20" },
            { icon: Layers, label: "Performance Tracking", color: "from-orange-500/20 to-red-500/20" }
          ].map((feature, index) => (
            <motion.div 
              key={feature.label}
              className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${feature.color} backdrop-blur-xl rounded-full border border-white/10 shadow-lg`}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300, delay: index * 0.1 }}
            >
              <feature.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
});

RepositoryHero.displayName = "RepositoryHero";