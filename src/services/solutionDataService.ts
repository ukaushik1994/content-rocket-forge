import { Solution } from '@/contexts/content-builder/types';

/**
 * Centralized service for solution data integration across modules
 * Provides consistent solution data structure for display and content integration
 */

export interface MinimalSolutionData {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface SolutionReference {
  solutionId: string;
  name: string;
  logoUrl: string | null;
}

export class SolutionDataService {
  /**
   * Extract minimal solution data for display purposes
   */
  static getMinimalSolutionData(solution: Solution): MinimalSolutionData {
    return {
      id: solution.id,
      name: solution.name,
      logoUrl: solution.logoUrl
    };
  }

  /**
   * Create solution reference for content metadata
   */
  static createSolutionReference(solution: Solution): SolutionReference {
    return {
      solutionId: solution.id,
      name: solution.name,
      logoUrl: solution.logoUrl
    };
  }

  /**
   * Extract solution reference from content metadata
   */
  static extractSolutionReference(metadata: any): SolutionReference | null {
    if (!metadata?.solution) return null;
    
    return {
      solutionId: metadata.solution.id || metadata.solution.solutionId,
      name: metadata.solution.name,
      logoUrl: metadata.solution.logoUrl || null
    };
  }

  /**
   * Get initials from solution name for fallback display
   */
  static getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  /**
   * Validate solution data completeness
   */
  static validateSolutionForDisplay(solution: Solution): boolean {
    return !!(solution.id && solution.name);
  }

  /**
   * Format solution data for consistent display across components
   */
  static formatForDisplay(solution: Solution) {
    return {
      ...this.getMinimalSolutionData(solution),
      initials: this.getInitials(solution.name),
      isValid: this.validateSolutionForDisplay(solution)
    };
  }
}

export const solutionDataService = new SolutionDataService();