import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, BarChart2, Award } from 'lucide-react';
import { motion } from 'framer-motion';
interface FinalReviewHeaderProps {
  completionPercentage: number;
  passedChecks: number;
  totalChecks: number;
  seoScore?: number;
}
export const FinalReviewHeader: React.FC<FinalReviewHeaderProps> = ({
  completionPercentage,
  passedChecks,
  totalChecks,
  seoScore
}) => {
  // Get color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 60) return 'from-yellow-500 to-amber-500';
    if (percentage >= 40) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };
  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-300';
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-amber-500';
    if (score >= 40) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };
  return <div className="bg-gradient-to-r from-purple-950/20 via-indigo-950/10 to-blue-950/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-500">
            Final Review & Optimization
          </h2>
          <p className="text-muted-foreground">
            Review your content and optimize it for SEO before publishing.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          {seoScore !== undefined && <div className="flex flex-col items-center">
              
              <div className="relative">
                
                {seoScore >= 80 && <motion.div className="absolute -top-2 -right-2" initial={{
              scale: 0,
              rotate: -30
            }} animate={{
              scale: 1,
              rotate: 0
            }} transition={{
              delay: 0.3,
              duration: 0.5,
              type: "spring"
            }}>
                    <Award className="h-6 w-6 text-yellow-400 drop-shadow" />
                  </motion.div>}
              </div>
            </div>}
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Completion</span>
            </div>
            <motion.div className={`h-16 w-16 rounded-full bg-gradient-to-r ${getProgressColor(completionPercentage)} flex items-center justify-center shadow-lg`} initial={{
            scale: 0.8,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            duration: 0.5,
            delay: 0.1,
            type: "spring"
          }}>
              <span className="text-white text-xl font-bold">{completionPercentage}%</span>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="w-full flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex-1">
          <div className="flex justify-between mb-2 text-sm">
            <span className="flex items-center gap-2">
              <motion.div animate={{
              scale: [1, 1.2, 1]
            }} transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 3
            }} className="w-2 h-2 bg-purple-500 rounded-full"></motion.div>
              Content Readiness
            </span>
            <span>{passedChecks} of {totalChecks} checks passed</span>
          </div>
          <div className="h-3 w-full bg-purple-950/30 rounded-full overflow-hidden">
            <motion.div className={`h-full bg-gradient-to-r ${getProgressColor(completionPercentage)}`} style={{
            width: '0%'
          }} animate={{
            width: `${completionPercentage}%`
          }} transition={{
            duration: 1,
            ease: "easeOut"
          }}></motion.div>
          </div>
        </div>
        
        <motion.div initial={{
        scale: 0.9,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} transition={{
        duration: 0.5,
        delay: 0.3
      }}>
          <Badge className={`${completionPercentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-amber-500'} text-white px-3 py-2 text-sm flex items-center gap-1.5 shadow-md`}>
            {completionPercentage >= 80 ? <>
                <CheckCircle className="h-4 w-4" />
                Ready to publish
              </> : <>
                <AlertTriangle className="h-4 w-4" />
                Needs optimization
              </>}
          </Badge>
        </motion.div>
      </div>
    </div>;
};