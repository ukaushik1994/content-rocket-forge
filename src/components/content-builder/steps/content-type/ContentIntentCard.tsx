
import React from 'react';

interface ContentIntentCardProps {
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export const ContentIntentCard: React.FC<ContentIntentCardProps> = ({
  title,
  description,
  icon,
  selected,
  onClick,
}) => {
  return (
    <div
      className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-primary/50 hover:bg-accent/5'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-2xl">{icon}</div>
        <h4 className="font-medium">{title}</h4>
        {selected && (
          <div className="ml-auto bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
