
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle } from 'lucide-react';

interface RunChecksButtonProps {
  isRunningAllChecks: boolean;
  onRunChecks: () => void;
  className?: string;
  icon?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export const RunChecksButton = ({ 
  isRunningAllChecks, 
  onRunChecks,
  className = "",
  icon = true,
  variant = "default"
}: RunChecksButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button 
        onClick={onRunChecks}
        disabled={isRunningAllChecks}
        variant={variant}
        className={className}
      >
        {isRunningAllChecks ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Running Checks...
          </>
        ) : (
          <>
            {icon && <CheckCircle className="h-4 w-4 mr-2" />}
            Run All Checks
          </>
        )}
      </Button>
    </motion.div>
  );
};
