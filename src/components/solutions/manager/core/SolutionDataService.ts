import { supabase } from '@/integrations/supabase/client';
import { EnhancedSolution, EnhancedSolutionResource } from '@/contexts/content-builder/types/enhanced-solution-types';

export interface SolutionFormData {
  name: string;
  description?: string;
  short_description?: string;
  features?: string[];
  use_cases?: string[];
  pain_points?: string[];
  target_audience?: string[];
  category?: string;
  external_url?: string;
  resources?: EnhancedSolutionResource[];
  tags?: string[];
  benefits?: string[];
  integrations?: string[];
  market_data?: any;
  competitors?: any[];
  technical_specs?: any;
  pricing_model?: any;
  case_studies?: any[];
  metrics?: any;
  unique_value_propositions?: string[];
  positioning_statement?: string;
  key_differentiators?: string[];
  metadata?: any;
}

export interface SolutionApiResponse {
  success: boolean;
  data?: EnhancedSolution;
  error?: string;
}

export interface SolutionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Centralized data service for solution CRUD operations
 * Handles all backend communication, validation, and data transformation
 */
export class SolutionDataService {
  
  /**
   * Create a new solution with optional logo upload
   */
  async createSolution(formData: SolutionFormData, logoFile?: File): Promise<SolutionApiResponse> {
    try {
      // Validate authentication first
      const user = await this.ensureAuthenticated();
      
      // Validate form data
      const validation = this.validateFormData(formData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Upload logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        logoUrl = await this.uploadLogo(logoFile);
      }

      // Transform and prepare data for database
      const dbData = this.transformFormToDatabase(formData);
      if (logoUrl) {
        dbData.logo_url = logoUrl;
      }
      dbData.user_id = user.id;

      console.log('Creating solution:', dbData);

      // Insert into database
      const { data, error } = await supabase
        .from('solutions')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Database error creating solution:', error);
        throw new Error(`Failed to create solution: ${error.message}`);
      }

      // Transform back to enhanced format
      const enhancedSolution = this.transformDatabaseToEnhanced(data);
      
      return { success: true, data: enhancedSolution };
    } catch (error) {
      console.error('Error creating solution:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create solution' 
      };
    }
  }

  /**
   * Update an existing solution with optional logo upload
   */
  async updateSolution(id: string, formData: Partial<SolutionFormData>, logoFile?: File): Promise<SolutionApiResponse> {
    try {
      // Validate authentication
      const user = await this.ensureAuthenticated();
      
      // Validate form data if name is provided
      if (formData.name !== undefined) {
        const validation = this.validateFormData(formData as SolutionFormData);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      // Upload new logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        logoUrl = await this.uploadLogo(logoFile);
      }

      // Transform data for database
      const dbData = this.transformFormToDatabase(formData);
      if (logoUrl) {
        dbData.logo_url = logoUrl;
      }

      console.log('Updating solution:', id, dbData);

      // Update in database
      const { data, error } = await supabase
        .from('solutions')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Database error updating solution:', error);
        throw new Error(`Failed to update solution: ${error.message}`);
      }

      if (!data) {
        throw new Error('Solution not found or you do not have permission to update it');
      }

      // Transform back to enhanced format
      const enhancedSolution = this.transformDatabaseToEnhanced(data);
      
      return { success: true, data: enhancedSolution };
    } catch (error) {
      console.error('Error updating solution:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update solution' 
      };
    }
  }

  /**
   * Upload a logo file to Supabase storage
   */
  private async uploadLogo(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('solution-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage error uploading logo:', error);
        throw new Error(`Failed to upload logo: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('solution-logos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw new Error('Failed to upload logo file');
    }
  }

  /**
   * Ensure user is authenticated
   */
  private async ensureAuthenticated() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('You must be logged in to perform this action');
    }
    return user;
  }

  /**
   * Validate form data before submission
   */
  private validateFormData(data: Partial<SolutionFormData>): SolutionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Solution name is required');
    }

    // Length validations
    if (data.name && data.name.length > 255) {
      errors.push('Solution name must be less than 255 characters');
    }

    // URL validations
    if (data.external_url && !this.isValidUrl(data.external_url)) {
      errors.push('External URL must be a valid URL');
    }

    // Validate resource URLs
    if (data.resources) {
      data.resources.forEach((resource, index) => {
        if (!this.isValidUrl(resource.url)) {
          errors.push(`Resource ${index + 1} URL is invalid`);
        }
      });
    }

    // Warnings for incomplete data
    if (!data.description || data.description.trim().length === 0) {
      warnings.push('Consider adding a description to make your solution more discoverable');
    }

    if (!data.features || data.features.length === 0) {
      warnings.push('Adding features will help users understand your solution better');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if a string is a valid URL
   */
  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Transform form data to database format
   */
  private transformFormToDatabase(formData: Partial<SolutionFormData>): any {
    return {
      name: formData.name,
      description: formData.description,
      short_description: formData.short_description,
      features: formData.features || [],
      use_cases: formData.use_cases || [],
      pain_points: formData.pain_points || [],
      target_audience: formData.target_audience || [],
      category: formData.category || 'Business Solution',
      external_url: formData.external_url,
      resources: formData.resources || [],
      tags: formData.tags || [],
      benefits: formData.benefits || [],
      integrations: formData.integrations || [],
      market_data: formData.market_data || {},
      competitors: formData.competitors || [],
      technical_specs: formData.technical_specs || {},
      pricing_model: formData.pricing_model || {},
      case_studies: formData.case_studies || [],
      metrics: formData.metrics || {},
      unique_value_propositions: formData.unique_value_propositions || [],
      positioning_statement: formData.positioning_statement,
      key_differentiators: formData.key_differentiators || [],
      metadata: formData.metadata || {}
    };
  }

  /**
   * Transform database data to enhanced solution format
   */
  private transformDatabaseToEnhanced(dbData: any): EnhancedSolution {
    return {
      id: dbData.id,
      name: dbData.name,
      description: dbData.description || '',
      shortDescription: dbData.short_description,
      features: Array.isArray(dbData.features) ? dbData.features : [],
      useCases: Array.isArray(dbData.use_cases) ? dbData.use_cases : [],
      painPoints: Array.isArray(dbData.pain_points) ? dbData.pain_points : [],
      targetAudience: Array.isArray(dbData.target_audience) ? dbData.target_audience : [],
      category: dbData.category || 'Business Solution',
      logoUrl: dbData.logo_url,
      externalUrl: dbData.external_url,
      resources: Array.isArray(dbData.resources) ? dbData.resources : [],
      tags: Array.isArray(dbData.tags) ? dbData.tags : [],
      benefits: Array.isArray(dbData.benefits) ? dbData.benefits : [],
      integrations: Array.isArray(dbData.integrations) ? dbData.integrations : [],
      marketData: dbData.market_data || {},
      competitors: Array.isArray(dbData.competitors) ? dbData.competitors : [],
      technicalSpecs: dbData.technical_specs || {},
      pricing: dbData.pricing_model || {},
      caseStudies: Array.isArray(dbData.case_studies) ? dbData.case_studies : [],
      metrics: dbData.metrics || {},
      uniqueValuePropositions: Array.isArray(dbData.unique_value_propositions) ? dbData.unique_value_propositions : [],
      positioningStatement: dbData.positioning_statement,
      keyDifferentiators: Array.isArray(dbData.key_differentiators) ? dbData.key_differentiators : [],
      metadata: dbData.metadata || {}
    };
  }
}

export const solutionDataService = new SolutionDataService();