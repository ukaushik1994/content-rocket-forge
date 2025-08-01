
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: keyof typeof LucideIcons;
  trend?: {
    value: number;
    positive: boolean;
  };
  gradient?: string;
  className?: string;
}

export function EnhancedStatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  gradient = "from-white/5 to-white/10",
  className 
}: EnhancedStatCardProps) {
  // Get the icon component if it exists
  const IconComponent = icon && (LucideIcons[icon] as LucideIcon | undefined);
  
  return (
    <motion.div
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 } 
      }}
      className="group h-full"
    >
      <Card className={cn(
        "h-full overflow-hidden bg-gradient-to-br from-black/40 via-black/20 to-transparent backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 relative group-hover:shadow-2xl",
        className
      )}>
        {/* Animated background gradient */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-all duration-500`}
          initial={false}
        />
        
        {/* Glow effect */}
        <motion.div 
          className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-lg opacity-0 group-hover:opacity-30 blur transition-opacity duration-500"
          animate={{ 
            opacity: [0, 0.1, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 4,
            ease: "easeInOut"
          }}
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        {/* Content */}
        <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
          <CardTitle className="text-sm font-medium text-white/80 group-hover:text-white/90 transition-colors duration-200">
            {title}
          </CardTitle>
          {IconComponent && (
            <motion.div
              className="p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 group-hover:border-white/30 transition-all duration-300"
              whileHover={{ 
                scale: 1.1,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                transition: { duration: 0.2 }
              }}
            >
              <IconComponent className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </CardHeader>
        
        <CardContent className="relative z-10 pb-6">
          <motion.div 
            className="text-2xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/90 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300"
            initial={false}
            whileHover={{ scale: 1.05 }}
          >
            {value}
          </motion.div>
          
          {(description || trend) && (
            <div className="flex items-center mt-3 gap-3">
              {trend && (
                <motion.div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-xl border transition-all duration-300",
                    trend.positive 
                      ? "text-green-400 bg-green-400/10 border-green-400/20 hover:bg-green-400/20" 
                      : "text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.span
                    animate={{ 
                      rotate: trend.positive ? [0, 5, 0] : [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {trend.positive ? (
                      <LucideIcons.TrendingUp className="h-3 w-3" />
                    ) : (
                      <LucideIcons.TrendingDown className="h-3 w-3" />
                    )}
                  </motion.span>
                  {trend.positive ? "+" : "-"}{trend.value}%
                </motion.div>
              )}
              
              {description && (
                <p className="text-xs text-white/60 group-hover:text-white/70 transition-colors duration-200">
                  {description}
                </p>
              )}
            </div>
          )}
        </CardContent>
        
        {/* Floating particle effect */}
        <div className="absolute top-4 right-4 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <motion.div
            className="w-full h-full bg-white/40 rounded-full"
            animate={{
              scale: [1, 2, 1],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </div>
      </Card>
    </motion.div>
  );
}
