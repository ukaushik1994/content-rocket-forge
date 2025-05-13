
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, Search } from 'lucide-react';

interface ProgressItemProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  index: number;
}

export const ProgressItem: React.FC<ProgressItemProps> = ({ icon, title, color, index }) => {
  return (
    <motion.div 
      className={`border border-white/10 rounded-lg p-4 bg-gradient-to-br ${color} backdrop-blur-md`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1,
        y: 0,
      }}
      transition={{ 
        delay: 0.5 + index * 0.2,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
          {icon}
        </div>
        <div className="text-sm font-medium">{title}</div>
      </div>
      
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: 5 + index * 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
};

export const ProgressIndicators: React.FC = () => {
  const indicators = [
    { 
      icon: <TrendingUp className="h-5 w-5 text-blue-400" />, 
      title: "Analyzing Keywords",
      color: "from-blue-500/20 to-blue-700/10"
    },
    { 
      icon: <FileText className="h-5 w-5 text-purple-400" />, 
      title: "Extracting Content",
      color: "from-purple-500/20 to-purple-700/10"
    },
    { 
      icon: <Search className="h-5 w-5 text-green-400" />, 
      title: "Finding Opportunities",
      color: "from-green-500/20 to-green-700/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl">
      {indicators.map((item, index) => (
        <ProgressItem
          key={index}
          icon={item.icon}
          title={item.title}
          color={item.color}
          index={index}
        />
      ))}
    </div>
  );
};
