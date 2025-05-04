
import React from 'react';

interface ScoreBadgeProps {
  score: number;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let bgColor = "bg-red-500/20";
  
  if (score >= 80) {
    bgColor = "bg-green-500/20";
  } else if (score >= 60) {
    bgColor = "bg-yellow-500/20";
  }
  
  return (
    <div className={`w-7 h-3 ${bgColor} rounded-full`}></div>
  );
};
