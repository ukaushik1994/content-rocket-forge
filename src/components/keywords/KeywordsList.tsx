
import React from 'react';
import { KeywordItemProps } from '@/pages/Keywords';

// Define the interface for the component
export interface KeywordsListProps {
  keywords: KeywordItemProps[];
}

export const KeywordsList: React.FC<KeywordsListProps> = ({ keywords }) => {
  // Create placeholder implementation if the file doesn't exist
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-glass border-b border-white/10">
            <th className="text-left py-2 px-4">Keyword</th>
            <th className="text-left py-2 px-4">Volume</th>
            <th className="text-left py-2 px-4">Difficulty</th>
            <th className="text-left py-2 px-4">CPC</th>
            <th className="text-left py-2 px-4">Intent</th>
            <th className="text-left py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {keywords.map((keyword) => (
            <tr key={keyword.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-2 px-4">{keyword.primary}</td>
              <td className="py-2 px-4">{keyword.volume.toLocaleString()}</td>
              <td className="py-2 px-4">{keyword.difficulty}/100</td>
              <td className="py-2 px-4">${keyword.cpc.toFixed(2)}</td>
              <td className="py-2 px-4">{keyword.intent}</td>
              <td className="py-2 px-4">
                <button className="text-primary hover:text-primary/80">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
