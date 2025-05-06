
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ContentTypeProps {
  type: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export const ContentTypeCard: React.FC<ContentTypeProps> = ({ 
  type, 
  isSelected, 
  onSelect 
}) => {
  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary/50 bg-primary/5 shadow-lg' 
          : 'border-white/5 bg-white/2 hover:bg-white/5'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-5 flex flex-col items-start gap-3">
        <div className={`p-2 rounded-md ${isSelected ? 'bg-primary/20' : 'bg-white/5'}`}>
          {type.icon}
        </div>
        
        <div>
          <h3 className="font-medium mb-1">{type.title}</h3>
          <p className="text-sm text-muted-foreground">{type.description}</p>
        </div>
        
        {isSelected && (
          <motion.div 
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </CardContent>
    </Card>
  );
};
