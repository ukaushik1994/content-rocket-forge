
export const validateDraftData = (draft: any) => {
  const errors: string[] = [];
  
  if (!draft) {
    errors.push('Draft data is missing');
    return { isValid: false, errors };
  }
  
  if (!draft.id || typeof draft.id !== 'string') {
    errors.push('Draft ID is missing or invalid');
  }
  
  if (!draft.title || typeof draft.title !== 'string') {
    errors.push('Draft title is missing or invalid');
  }
  
  if (draft.keywords && !Array.isArray(draft.keywords)) {
    errors.push('Keywords should be an array');
  }
  
  if (draft.content && typeof draft.content !== 'string') {
    errors.push('Content should be a string');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateKeywordUsage = (keywordUsage: any[]) => {
  if (!Array.isArray(keywordUsage)) {
    return { isValid: false, errors: ['Keyword usage should be an array'] };
  }
  
  const errors: string[] = [];
  
  keywordUsage.forEach((usage, index) => {
    if (!usage || typeof usage !== 'object') {
      errors.push(`Keyword usage item ${index} is invalid`);
      return;
    }
    
    if (!usage.keyword || typeof usage.keyword !== 'string') {
      errors.push(`Keyword usage item ${index} missing valid keyword`);
    }
    
    if (typeof usage.count !== 'number' || usage.count < 0) {
      errors.push(`Keyword usage item ${index} has invalid count`);
    }
    
    if (!usage.density || typeof usage.density !== 'string') {
      errors.push(`Keyword usage item ${index} missing valid density`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAnalysisData = (analysisData: any) => {
  const errors: string[] = [];
  
  if (!analysisData || typeof analysisData !== 'object') {
    errors.push('Analysis data is missing or invalid');
    return { isValid: false, errors };
  }
  
  // Validate SERP data structure if present
  if (analysisData.serpData && typeof analysisData.serpData !== 'object') {
    errors.push('SERP data should be an object');
  }
  
  // Validate document structure if present
  if (analysisData.documentStructure && typeof analysisData.documentStructure !== 'object') {
    errors.push('Document structure should be an object');
  }
  
  // Validate keyword usage array
  if (analysisData.keywordUsage) {
    const keywordValidation = validateKeywordUsage(analysisData.keywordUsage);
    if (!keywordValidation.isValid) {
      errors.push(...keywordValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
