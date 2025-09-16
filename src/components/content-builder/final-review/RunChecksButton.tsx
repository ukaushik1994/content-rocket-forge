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
  return (
    <Button
      onClick={onRunChecks}
      disabled={isRunningAllChecks}
      variant={variant}
      className={className}
    >
      {isRunningAllChecks ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mr-2"
        >
          <RefreshCw className="h-4 w-4" />
        </motion.div>
      ) : (
        icon && <CheckCircle className="h-4 w-4 mr-2" />
      )}
      {label}
    </Button>
  );
};