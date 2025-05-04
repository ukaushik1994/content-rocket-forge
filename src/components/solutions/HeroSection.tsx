
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  solutionCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  solutionCount, 
  searchTerm, 
  onSearchChange 
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-purple/20 via-background to-neon-blue/10 p-8 mb-8 border border-white/10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-neon-purple opacity-[0.07] blur-[80px]" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-neon-blue opacity-[0.07] blur-[60px]" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <motion.div variants={itemVariants} className="inline-block">
              <div className="flex items-center space-x-2 bg-neon-purple/20 rounded-full px-3 py-1 text-sm font-medium text-neon-purple">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Business Solutions Hub</span>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gradient"
            >
              Transform Your Content Strategy with Business Solutions
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-muted-foreground text-lg"
            >
              Create compelling content that highlights your products, services, and expertise. 
              Our business solutions seamlessly integrate into your content creation workflow.
            </motion.p>
            
            <motion.div 
              variants={itemVariants} 
              className="flex gap-3 mt-2"
            >
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search solutions by name, features, use cases..."
                  className="pl-10 bg-background/50 border-white/10 backdrop-blur-sm w-full"
                />
              </div>
              
              <Button variant="outline" size="icon" className="flex-shrink-0 bg-background/50 border-white/10 backdrop-blur-sm">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </motion.div>
          </div>
          
          <motion.div
            variants={itemVariants}
            className="bg-glass text-center p-4 rounded-xl border border-white/10 min-w-[140px] backdrop-blur-sm"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gradient mb-1">{solutionCount}</h3>
            <p className="text-muted-foreground text-sm">
              {solutionCount === 1 ? 'Solution' : 'Solutions'} Available
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
