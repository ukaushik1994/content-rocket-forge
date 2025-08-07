import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface TitleSelectionCardProps {
  titles: string[];
  selectedTitle: string | null;
  onSelectTitle: (title: string) => void;
  onGenerateMore: () => void;
  isGenerating: boolean;
  isVisible: boolean;
}
export const TitleSelectionCard: React.FC<TitleSelectionCardProps> = ({
  titles,
  selectedTitle,
  onSelectTitle,
  onGenerateMore,
  isGenerating,
  isVisible
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  if (!isVisible) return null;
  return <AnimatePresence>
      <motion.div initial={{
      opacity: 0,
      y: 20,
      scale: 0.95
    }} animate={{
      opacity: 1,
      y: 0,
      scale: 1
    }} exit={{
      opacity: 0,
      y: -20,
      scale: 0.95
    }} transition={{
      duration: 0.4,
      ease: "easeOut"
    }} className="mb-4">
        
      </motion.div>
    </AnimatePresence>;
};