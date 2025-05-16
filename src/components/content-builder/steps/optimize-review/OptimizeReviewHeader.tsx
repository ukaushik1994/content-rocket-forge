
import React from 'react';
import { FinalReviewHeader } from '../../final-review/FinalReviewHeader';

interface OptimizeReviewHeaderProps {
  completionPercentage: number;
  passedChecks: number;
  totalChecks: number;
  seoScore: number;
}

export const OptimizeReviewHeader: React.FC<OptimizeReviewHeaderProps> = ({
  completionPercentage,
  passedChecks,
  totalChecks,
  seoScore
}) => {
  return (
    <FinalReviewHeader 
      completionPercentage={completionPercentage} 
      passedChecks={passedChecks}
      totalChecks={totalChecks}
      seoScore={seoScore}
    />
  );
};
