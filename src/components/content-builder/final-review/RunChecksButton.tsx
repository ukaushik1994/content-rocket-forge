
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface RunChecksButtonProps {
  isRunningAllChecks: boolean;
  onRunChecks: () => void;
  className?: string;
  icon?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  label?: string;
}

export const RunChecksButton = ({ 
  isRunningAllChecks, 
  onRunChecks,
  className = "",
  icon = true,
  variant = "default",
  label = "Run All Checks"
}: RunChecksButtonProps) => {
  const [checksRun, setChecksRun] = useState(false);
  const [checksSuccess, setChecksSuccess] = useState(false);
  
  const handleRunChecks = async () => {
    setChecksRun(false);
    setChecksSuccess(false);
    
    toast.info("Running comprehensive checks on your content...");
    
    try {
      // Call the provided onRunChecks function
      await onRunChecks();
      
      // Show success state
      setChecksRun(true);
      setChecksSuccess(true);
      
      // Reset success state after a delay
      setTimeout(() => {
        setChecksRun(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error running checks:", error);
      
      // Show error state
      setChecksRun(true);
      setChecksSuccess(false);
      
      toast.error("Some checks failed. Please try again.");
      
      // Reset error state after a delay
      setTimeout(() => {
        setChecksRun(false);
      }, 3000);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {checksRun && checksSuccess && (
        <motion.span 
          className="absolute -top-1 -right-1 z-10 text-green-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <CheckCircle className="h-5 w-5 stroke-[3]" />
        </motion.span>
      )}
      
      {checksRun && !checksSuccess && (
        <motion.span 
          className="absolute -top-1 -right-1 z-10 text-red-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <AlertCircle className="h-5 w-5 stroke-[3]" />
        </motion.span>
      )}
      
      <Button 
        onClick={handleRunChecks}
        disabled={isRunningAllChecks}
        variant={checksRun && checksSuccess ? "outline" : variant}
        className={`${className} ${checksRun && checksSuccess ? 'border-green-500 text-green-500 hover:text-green-600 hover:border-green-600' : ''} ${checksRun && !checksSuccess ? 'border-red-500 text-red-500' : ''}`}
      >
        {isRunningAllChecks ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Running Checks...
          </>
        ) : checksRun && checksSuccess ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Checks Complete
          </>
        ) : checksRun && !checksSuccess ? (
          <>
            <AlertCircle className="h-4 w-4 mr-2" />
            Check Failed
          </>
        ) : (
          <>
            {icon && <Sparkles className="h-4 w-4 mr-2" />}
            {label}
          </>
        )}
      </Button>
      
      {isRunningAllChecks && (
        <motion.div 
          className="absolute bottom-[-10px] left-0 h-[2px] bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5 }}
        />
      )}
    </motion.div>
  );
};
