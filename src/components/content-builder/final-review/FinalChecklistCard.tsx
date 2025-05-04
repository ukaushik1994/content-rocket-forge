
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinalChecklistProps {
  checks: {
    title: string;
    passed: boolean;
  }[];
}

export const FinalChecklistCard = ({ checks }: FinalChecklistProps) => {
  const passedChecks = checks.filter(check => check.passed).length;
  const progress = Math.round((passedChecks / checks.length) * 100);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <Card className="h-full shadow-xl bg-gradient-to-br from-background to-purple-950/5 border border-purple-500/20">
      <CardHeader className="pb-2 border-b border-purple-500/10">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Content Quality Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{passedChecks} of {checks.length} checks passed</span>
          <span className="text-sm font-medium text-green-500">{progress}%</span>
        </div>
        
        <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
            style={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          ></motion.div>
        </div>
        
        <motion.div 
          className="space-y-1 mt-2 max-h-[280px] overflow-y-auto pr-1 -mr-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {checks.map((check, index) => (
            <motion.div 
              key={index} 
              className={`flex items-start gap-3 p-3 rounded-md transition-all ${
                check.passed 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-secondary/20 hover:bg-secondary/30'
              }`}
              variants={itemVariants}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.01, x: 2 }}
            >
              <div className="mt-0.5">
                {check.passed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15, delay: index * 0.05 + 0.2 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </motion.div>
                ) : (
                  <XCircle className="h-5 w-5 text-red-500/70" />
                )}
              </div>
              <span className={`text-sm ${check.passed ? 'font-medium' : 'text-muted-foreground'}`}>
                {check.title}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};
