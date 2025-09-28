import React from 'react';
import { cn } from '@/lib/utils';

interface AccessibleTableWrapperProps {
  children: React.ReactNode;
  caption?: string;
  summary?: string;
  className?: string;
}

export const AccessibleTableWrapper: React.FC<AccessibleTableWrapperProps> = ({
  children,
  caption,
  summary,
  className
}) => {
  return (
    <div 
      className={cn("relative", className)}
      role="region"
      aria-label={caption || "Data table"}
      tabIndex={0}
    >
      {caption && (
        <div className="mb-2 text-sm font-medium text-foreground" id="table-caption">
          {caption}
        </div>
      )}
      
      <div className="overflow-auto focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === 'table') {
            return React.cloneElement(child as React.ReactElement, {
              'aria-describedby': summary ? 'table-summary' : undefined,
              'aria-labelledby': caption ? 'table-caption' : undefined,
              role: 'table'
            });
          }
          return child;
        })}
      </div>
      
      {summary && (
        <div 
          id="table-summary" 
          className="mt-2 text-xs text-muted-foreground sr-only"
        >
          {summary}
        </div>
      )}
      
      {/* Screen reader instructions */}
      <div className="sr-only">
        Use arrow keys to navigate table cells. Press Enter to read cell content.
      </div>
    </div>
  );
};