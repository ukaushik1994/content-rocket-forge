
import React from 'react';
import { Check } from 'lucide-react';

interface ContentType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
}

interface ContentTypeCardProps {
  type: ContentType;
  isSelected: boolean;
  onSelect: () => void;
}

export const ContentTypeCard: React.FC<ContentTypeCardProps> = ({ 
  type, 
  isSelected, 
  onSelect 
}) => {
  return (
    <div 
      className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-primary/10 border-primary shadow-sm' 
          : 'bg-card/50 border-border hover:bg-card/80'
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${isSelected ? 'bg-primary/20 text-primary' : 'bg-foreground/10'}`}>
            {type.icon}
          </div>
          <h3 className="font-medium text-base">{type.title}</h3>
          {isSelected && (
            <Check size={16} className="text-primary ml-auto" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{type.description}</p>
      </div>
    </div>
  );
};
