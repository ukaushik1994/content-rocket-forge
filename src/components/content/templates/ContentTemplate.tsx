
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ContentTemplateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  featured?: boolean;
}

export const ContentTemplate = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  className, 
  featured = false 
}: ContentTemplateProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-300 h-full", 
          featured 
            ? "bg-gradient-to-br from-neon-purple/20 to-neon-blue/5 hover:from-neon-purple/30 hover:to-neon-blue/10 border-neon-purple/30" 
            : "hover:border-primary/50 hover:bg-primary/5 border-white/10",
          className
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-5 flex flex-col items-center text-center">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300",
            featured 
              ? "bg-gradient-to-br from-neon-purple/30 to-neon-blue/20" 
              : "bg-primary/10"
          )}>
            {icon}
            {isHovered && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute w-full h-full rounded-full bg-primary/5 -z-10"
                style={{ 
                  animationDuration: '2s',
                  animationIterationCount: 'infinite',
                  animationName: 'pulse',
                  animationTimingFunction: 'ease-in-out'
                }}
              />
            )}
          </div>
          <h5 className={cn(
            "font-medium transition-all duration-300",
            featured ? "text-gradient" : ""
          )}>
            {title}
          </h5>
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
          
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <Button 
                size="sm" 
                variant={featured ? "default" : "outline"}
                className={cn(
                  "text-xs w-full",
                  featured ? "bg-gradient-to-r from-neon-purple to-neon-blue" : ""
                )}
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Generate
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
