import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, FileText, AlertCircle, Database } from 'lucide-react';

interface KeywordStatsProps {
  total: number;
  inPublished: number;
  inDraft: number;
  cannibalization: number;
}

export const KeywordStats: React.FC<KeywordStatsProps> = ({
  total,
  inPublished,
  inDraft,
  cannibalization
}) => {
  const stats = [
    { icon: Database, label: 'Total Keywords', value: total, color: 'text-blue-400' },
    { icon: FileText, label: 'In Published', value: inPublished, color: 'text-green-400' },
    { icon: FileText, label: 'In Draft', value: inDraft, color: 'text-yellow-400' },
    { icon: AlertCircle, label: 'Warnings', value: cannibalization, color: 'text-orange-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background/40 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
