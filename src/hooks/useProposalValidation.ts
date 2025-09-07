import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ProposalValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const useProposalValidation = () => {
  const [validationResults, setValidationResults] = useState<Record<string, ProposalValidationResult>>({});

  const validateProposal = (proposal: any, index?: number): ProposalValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Critical validations
    if (!proposal.primary_keyword || !proposal.primary_keyword.trim()) {
      errors.push('Primary keyword is missing');
    }
    
    if (!proposal.title || !proposal.title.trim()) {
      errors.push('Title is missing');
    }
    
    if (!proposal.description || !proposal.description.trim()) {
      warnings.push('Description is missing');
    }
    
    // Data quality validations
    if (proposal.primary_keyword && proposal.primary_keyword.length > 100) {
      warnings.push('Primary keyword is unusually long');
    }
    
    if (proposal.estimated_impressions && proposal.estimated_impressions < 0) {
      warnings.push('Estimated impressions is negative');
    }
    
    if (!proposal.priority_tag) {
      warnings.push('Priority tag is missing');
    }
    
    if (!proposal.content_type) {
      warnings.push('Content type is missing');
    }
    
    // Keyword quality checks
    if (proposal.primary_keyword && /[^a-zA-Z0-9\s\-_]/.test(proposal.primary_keyword)) {
      warnings.push('Primary keyword contains special characters');
    }
    
    if (proposal.related_keywords && !Array.isArray(proposal.related_keywords)) {
      errors.push('Related keywords should be an array');
    }
    
    if (proposal.content_suggestions && !Array.isArray(proposal.content_suggestions)) {
      errors.push('Content suggestions should be an array');
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings
    };
    
    // Cache the result
    const key = `${index}-${proposal.primary_keyword || proposal.title}`;
    setValidationResults(prev => ({ ...prev, [key]: result }));
    
    return result;
  };

  const validateProposalBatch = (proposals: any[]): {
    validProposals: any[];
    invalidProposals: any[];
    totalErrors: number;
    totalWarnings: number;
  } => {
    const validProposals: any[] = [];
    const invalidProposals: any[] = [];
    let totalErrors = 0;
    let totalWarnings = 0;
    
    proposals.forEach((proposal, index) => {
      const result = validateProposal(proposal, index);
      
      if (result.isValid) {
        validProposals.push(proposal);
      } else {
        invalidProposals.push({ proposal, errors: result.errors, warnings: result.warnings });
      }
      
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    });
    
    // Show summary toast
    if (totalErrors > 0) {
      toast.error(`Validation failed: ${totalErrors} errors, ${totalWarnings} warnings`, {
        description: `${invalidProposals.length} proposals have validation issues`
      });
    } else if (totalWarnings > 0) {
      toast.warning(`Data quality issues: ${totalWarnings} warnings`, {
        description: 'Proposals saved but may have quality issues'
      });
    } else {
      toast.success(`All ${proposals.length} proposals validated successfully`);
    }
    
    // Log detailed results in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Proposal validation results:', {
        total: proposals.length,
        valid: validProposals.length,
        invalid: invalidProposals.length,
        totalErrors,
        totalWarnings,
        invalidDetails: invalidProposals
      });
    }
    
    return {
      validProposals,
      invalidProposals,
      totalErrors,
      totalWarnings
    };
  };

  const getValidationResult = (proposal: any, index?: number): ProposalValidationResult | null => {
    const key = `${index}-${proposal.primary_keyword || proposal.title}`;
    return validationResults[key] || null;
  };

  return {
    validateProposal,
    validateProposalBatch,
    getValidationResult,
    validationResults
  };
};