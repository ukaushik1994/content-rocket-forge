import { useState, useCallback } from 'react';
import { ChartConfiguration } from '@/types/enhancedChat';

interface ValidationResult {
  isOptimal: boolean;
  suggestedType?: 'line' | 'bar' | 'pie' | 'area';
  reason?: string;
  canProceed: boolean;
}

export const useChartTypeValidator = () => {
  const [validationResults, setValidationResults] = useState<Record<number, ValidationResult>>({});

  const validateChartType = useCallback((chart: ChartConfiguration, index: number): ValidationResult => {
    const data = chart.data || [];
    const type = chart.type;
    
    // Pie chart validation
    if (type === 'pie') {
      // Check data format
      const hasCorrectFormat = data.every(d => 
        d.hasOwnProperty('name') && d.hasOwnProperty('value')
      );
      
      if (!hasCorrectFormat) {
        return {
          isOptimal: false,
          suggestedType: 'bar',
          reason: 'Pie chart data must have "name" and "value" properties',
          canProceed: false
        };
      }
      
      if (data.length > 7) {
        return {
          isOptimal: false,
          suggestedType: 'bar',
          reason: `Too many categories (${data.length}) for pie chart. Bar chart recommended.`,
          canProceed: true
        };
      }
      
      const totalValue = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
      if (totalValue === 0) {
        return {
          isOptimal: false,
          suggestedType: 'bar',
          reason: 'Pie chart requires non-zero values',
          canProceed: false
        };
      }
    }
    
    // Line chart validation
    if (type === 'line') {
      const hasTimeField = data.some(d => 
        String(d.name).match(/\d{4}/) || 
        String(d.name).match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i)
      );
      
      if (!hasTimeField && data.length < 5) {
        return {
          isOptimal: false,
          suggestedType: 'bar',
          reason: 'Line charts work best with time-series or many data points',
          canProceed: true
        };
      }
    }
    
    return {
      isOptimal: true,
      canProceed: true
    };
  }, []);

  return {
    validateChartType,
    validationResults
  };
};
