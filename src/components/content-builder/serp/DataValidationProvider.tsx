import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface DataValidationContextType {
  validateSerpData: (data: any) => boolean;
  validateKeyword: (keyword: string) => boolean;
  isDataComplete: (data: any) => boolean;
  getValidationErrors: () => string[];
}

const DataValidationContext = createContext<DataValidationContextType | undefined>(undefined);

interface DataValidationProviderProps {
  children: React.ReactNode;
}

export const DataValidationProvider: React.FC<DataValidationProviderProps> = ({ children }) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateKeyword = (keyword: string): boolean => {
    const errors: string[] = [];
    
    if (!keyword || keyword.trim() === '') {
      errors.push('Keyword cannot be empty');
      return false;
    }
    
    if (keyword.length < 2) {
      errors.push('Keyword must be at least 2 characters long');
    }
    
    if (keyword.length > 100) {
      errors.push('Keyword is too long (max 100 characters)');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateSerpData = (data: any): boolean => {
    const errors: string[] = [];
    
    if (!data) {
      errors.push('SERP data is null or undefined');
      setValidationErrors(errors);
      return false;
    }
    
    // Check required fields
    if (!data.keyword) {
      errors.push('SERP data missing keyword field');
    }
    
    // Validate arrays
    const arrayFields = ['entities', 'peopleAlsoAsk', 'headings', 'topResults', 'keywords'];
    arrayFields.forEach(field => {
      if (data[field] && !Array.isArray(data[field])) {
        errors.push(`${field} should be an array`);
      }
    });
    
    // Validate numeric fields
    const numericFields = ['searchVolume', 'keywordDifficulty', 'competitionScore'];
    numericFields.forEach(field => {
      if (data[field] !== undefined && (isNaN(data[field]) || data[field] < 0)) {
        errors.push(`${field} should be a positive number`);
      }
    });
    
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      console.warn('SERP data validation errors:', errors);
    }
    
    return errors.length === 0;
  };

  const isDataComplete = (data: any): boolean => {
    if (!validateSerpData(data)) {
      return false;
    }
    
    // Check if we have enough data for meaningful analysis
    const hasEntities = data.entities && data.entities.length > 0;
    const hasQuestions = data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0;
    const hasKeywords = data.keywords && data.keywords.length > 0;
    const hasResults = data.topResults && data.topResults.length > 0;
    
    const dataPoints = [hasEntities, hasQuestions, hasKeywords, hasResults].filter(Boolean).length;
    
    return dataPoints >= 2; // At least 2 types of data should be present
  };

  const getValidationErrors = (): string[] => {
    return validationErrors;
  };

  // Show validation errors as toasts
  useEffect(() => {
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast.error(`Data Validation: ${error}`, {
          duration: 3000
        });
      });
    }
  }, [validationErrors]);

  const value: DataValidationContextType = {
    validateSerpData,
    validateKeyword,
    isDataComplete,
    getValidationErrors
  };

  return (
    <DataValidationContext.Provider value={value}>
      {children}
    </DataValidationContext.Provider>
  );
};

export const useDataValidation = (): DataValidationContextType => {
  const context = useContext(DataValidationContext);
  if (context === undefined) {
    throw new Error('useDataValidation must be used within a DataValidationProvider');
  }
  return context;
};