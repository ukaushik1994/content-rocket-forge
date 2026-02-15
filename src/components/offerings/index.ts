// Re-export everything from solutions directory with new names
// This allows gradual migration while keeping all functionality

// Main components - re-exported with new names
export { HeroSection } from '@/components/solutions/HeroSection';
export { PersonaCard } from '@/components/solutions/PersonaCard';
export { SolutionUploader as OfferingUploader } from '@/components/solutions/SolutionUploader';
export { SolutionCompetitiveIntelDialog as OfferingCompetitiveIntelDialog } from '@/components/solutions/SolutionCompetitiveIntelDialog';
export { EnhancedSolutionCard as EnhancedOfferingCard } from '@/components/solutions/EnhancedSolutionCard';
export { EnhancedSolutionGrid as EnhancedOfferingGrid } from '@/components/solutions/EnhancedSolutionGrid';
export { SolutionCard as OfferingCard } from '@/components/solutions/SolutionCard';
