import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, SlidersHorizontal, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CompetitorIntelligenceHeaderProps {
  competitorCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddCompetitor: () => void;
}

export const CompetitorIntelligenceHeader: React.FC<CompetitorIntelligenceHeaderProps> = ({
  competitorCount,
  searchTerm,
  onSearchChange,
  onAddCompetitor
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-purple/20 via-background to-neon-blue/10 p-8 mb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-blue/10"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Futuristic grid overlay */}
      <div className="absolute inset-0 futuristic-grid opacity-30" />

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-neon-purple/30 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10">
        {/* Badge */}
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-white/10 mb-6"
          variants={itemVariants}
        >
          <Building2 className="h-4 w-4 text-neon-purple" />
          <span className="text-sm font-medium">Competitor Intelligence</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="flex-1">
            {/* Title */}
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-neon-purple to-neon-blue bg-clip-text text-transparent"
              variants={itemVariants}
            >
              Track and Analyze Your Competition
            </motion.h1>

            {/* Description */}
            <motion.p 
              className="text-lg text-muted-foreground mb-8 max-w-2xl"
              variants={itemVariants}
            >
              Gain strategic insights into your competitors' positioning, pricing, products, and market strategies. 
              Stay ahead with comprehensive intelligence analysis powered by AI.
            </motion.p>

            {/* Search and Filter */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 max-w-2xl"
              variants={itemVariants}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search competitors by name, industry, or position..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 bg-background/60 backdrop-blur-sm border-white/10 focus:border-neon-purple/50 h-12"
                />
              </div>
              <Button
                variant="outline"
                size="lg"
                className="bg-background/60 backdrop-blur-sm border-white/10 hover:border-neon-purple/50 hover:bg-background/80"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </motion.div>
          </div>

          {/* Stats Card */}
          <motion.div 
            className="lg:min-w-[280px]"
            variants={itemVariants}
          >
            <div className="glass-panel p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <Building2 className="h-5 w-5 text-neon-purple" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue opacity-20"
                />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-foreground">
                  {competitorCount}
                </p>
                <p className="text-sm text-muted-foreground">
                  {competitorCount === 1 ? 'Competitor Tracked' : 'Competitors Tracked'}
                </p>
              </div>
              <Button
                onClick={onAddCompetitor}
                className="w-full mt-4 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
