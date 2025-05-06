
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, BarChart2, Award, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface FinalReviewHeaderProps {
  completionPercentage: number;
  passedChecks: number;
  totalChecks: number;
  seoScore?: number;
  onRunAllChecks?: () => void;
  isRunningChecks?: boolean;
}

export const FinalReviewHeader: React.FC<FinalReviewHeaderProps> = ({
  completionPercentage,
  passedChecks,
  totalChecks,
  seoScore,
  onRunAllChecks,
  isRunningChecks = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
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

  const isReady = completionPercentage >= 80;
  const isOkay = completionPercentage >= 60;
  
  return (
    <motion.div 
      animate={{ y: 0, opacity: 1 }}
      initial={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-purple-950/20 via-indigo-950/10 to-blue-950/20 backdrop-blur-md border border-purple-500/30 rounded-xl overflow-hidden shadow-xl"
    >
      {/* Main header section */}
      <div className="p-6">
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
            {seoScore !== undefined && (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">SEO Score</span>
                </div>
                <div className="relative">
                  <motion.div 
                    className={`h-16 w-16 rounded-full bg-gradient-to-r ${getScoreColor(seoScore)} flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-white text-xl font-bold">{seoScore}</span>
                  </motion.div>
                  {seoScore >= 80 && (
                    <motion.div
                      className="absolute -top-2 -right-2"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                    >
                      <Award className="h-6 w-6 text-yellow-400 drop-shadow" />
                    </motion.div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Completion</span>
              </div>
              <motion.div 
                className={`h-16 w-16 rounded-full bg-gradient-to-r ${getProgressColor(completionPercentage)} flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white text-xl font-bold">{completionPercentage}%</span>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Content Readiness Section */}
        <div className="w-full flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex-1">
            <div className="flex justify-between mb-2 text-sm">
              <span className="flex items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                ></motion.div>
                Content Readiness
              </span>
              <span>{passedChecks} of {totalChecks} checks passed</span>
            </div>
            <div className="h-3 w-full bg-purple-950/30 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${getProgressColor(completionPercentage)}`}
                style={{ width: '0%' }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              ></motion.div>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Badge 
              className={`${
                isReady 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500'
                } text-white px-3 py-2 text-sm flex items-center gap-1.5 shadow-md`}
            >
              {isReady ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Ready to publish
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Needs optimization
                </>
              )}
            </Badge>
          </motion.div>
        </div>
        
        {/* Toggle for detailed status */}
        <div className="mt-4 flex justify-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-3 w-3" /> Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show details
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Expandable content status section */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: showDetails ? 'auto' : 0,
          opacity: showDetails ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className={`border-t border-purple-500/20 p-4 bg-gradient-to-br ${
          isReady 
            ? "from-green-950/20 to-black/20" 
            : "from-amber-950/20 to-black/20"
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                isReady ? "bg-green-500/20" : "bg-amber-500/20"
              }`}>
                {isReady 
                  ? <CheckCircle className="h-5 w-5 text-green-400" />
                  : <AlertTriangle className="h-5 w-5 text-amber-400" />
                }
              </div>
              <div>
                <h3 className="font-medium">{isReady ? "Ready to Save & Export" : "Content Status"}</h3>
                <p className="text-sm text-muted-foreground">
                  {isReady 
                    ? "Your content has passed all checks" 
                    : `Content is ${completionPercentage}% optimized, needs improvement`
                  }
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`
                      ${isReady ? "border-green-500/30 text-green-500" : 
                      isOkay ? "border-amber-500/30 text-amber-500" : 
                      "border-red-500/30 text-red-500"}
                    `}
                  >
                    {isReady ? "Ready for publishing" : 
                      isOkay ? "Needs minor improvements" : "Needs major improvements"}
                  </Badge>
                </div>
              </div>
            </div>
            
            {onRunAllChecks && (
              <Button
                onClick={onRunAllChecks}
                disabled={isRunningChecks}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2 self-end sm:self-auto"
              >
                {isRunningChecks ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Running Checks...
                  </>
                ) : (
                  <>
                    <Info className="h-4 w-4" />
                    Run All Checks
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Tip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 text-xs text-muted-foreground p-2 rounded-md bg-black/20 border border-white/5"
          >
            <div className="flex gap-2 items-center">
              <Info className="h-3 w-3 text-blue-400" />
              <span>Tip: Run all checks to get up-to-date content optimization recommendations</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
