
import React from 'react';

interface OutlineListProps {
  outline: string[];
}

export const OutlineList: React.FC<OutlineListProps> = ({ outline }) => {
  return (
    <ol className="list-decimal pl-4 text-sm space-y-1.5">
      {outline.map((item, index) => (
        <li key={index} className="text-muted-foreground">
          {item}
        </li>
      ))}
    </ol>
  );
};
