import React from 'react';
import { Container } from '@/components/ui/Container';
import { FeatureComparisonGrid } from './ai-showcase/FeatureComparisonGrid';

export const PerformanceSection = () => {
  return (
    <section className="py-8 md:py-12 backdrop-blur-[2px]">
      <Container>
        <FeatureComparisonGrid />
      </Container>
    </section>
  );
};
