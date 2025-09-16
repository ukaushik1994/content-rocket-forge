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
  return;
};