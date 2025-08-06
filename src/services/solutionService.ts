import { supabase } from '@/integrations/supabase/client';
import { EnhancedSolution, EnhancedSolutionResource } from '@/contexts/content-builder/types/enhanced-solution-types';
import { toast } from 'sonner';

export interface SolutionCreateData {
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

export interface SolutionUpdateData extends Partial<SolutionCreateData> {
  id: string;
}

class SolutionService {
  async getAllSolutions(): Promise<EnhancedSolution[]> {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching solutions:', error);
        toast.error('Failed to load solutions');
        return [];
      }

      return this.transformDatabaseToEnhanced(data || []);
    } catch (error) {
      console.error('Service error fetching solutions:', error);
      toast.error('Failed to load solutions');
      return [];
    }
  }

  async getSolutionById(id: string): Promise<EnhancedSolution | null> {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching solution:', error);
        toast.error('Failed to load solution');
        return null;
      }

      return this.transformDatabaseToEnhanced([data])[0] || null;
    } catch (error) {
      console.error('Service error fetching solution:', error);
      toast.error('Failed to load solution');
      return null;
    }
  }

  async createSolution(solutionData: SolutionCreateData, logoFile?: File): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to create a solution');
      }

      let logoUrl = null;

      // Upload logo if provided
      if (logoFile) {
        logoUrl = await this.uploadLogo(logoFile);
        if (!logoUrl) {
          throw new Error('Failed to upload logo');
        }
      }

      const dbData = this.transformEnhancedToDatabase(solutionData);
      if (logoUrl) {
        dbData.logo_url = logoUrl;
      }
      
      // Add user_id to the data
      dbData.user_id = user.id;

      console.log('Creating solution with data:', dbData);

      const { data, error } = await supabase
        .from('solutions')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Error creating solution:', error);
        throw new Error(`Failed to create solution: ${error.message}`);
      }

      console.log('Solution created successfully:', data);
      const transformedData = this.transformDatabaseToEnhanced([data])[0];
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Service error creating solution:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create solution';
      throw new Error(errorMessage);
    }
  }

  async updateSolution(id: string, solutionData: Partial<SolutionCreateData>, logoFile?: File): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to update a solution');
      }

      let logoUrl = undefined;

      // Upload new logo if provided
      if (logoFile) {
        logoUrl = await this.uploadLogo(logoFile);
        if (!logoUrl) {
          throw new Error('Failed to upload logo');
        }
      }

      const dbData = this.transformEnhancedToDatabase(solutionData);
      if (logoUrl) {
        dbData.logo_url = logoUrl;
      }

      console.log('Updating solution with data:', dbData);

      const { data, error } = await supabase
        .from('solutions')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own solutions
        .select()
        .single();

      if (error) {
        console.error('Error updating solution:', error);
        throw new Error(`Failed to update solution: ${error.message}`);
      }

      console.log('Solution updated successfully:', data);
      const transformedData = this.transformDatabaseToEnhanced([data])[0];
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Service error updating solution:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update solution';
      throw new Error(errorMessage);
    }
  }

  async deleteSolution(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('solutions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting solution:', error);
        toast.error('Failed to delete solution');
        return false;
      }

      toast.success('Solution deleted successfully');
      return true;
    } catch (error) {
      console.error('Service error deleting solution:', error);
      toast.error('Failed to delete solution');
      return false;
    }
  }

  private async uploadLogo(file: File): Promise<string | null> {
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
        console.error('Error uploading logo:', error);
        toast.error('Failed to upload logo');
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('solution-logos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Service error uploading logo:', error);
      toast.error('Failed to upload logo');
      return null;
    }
  }

  private transformDatabaseToEnhanced(dbSolutions: any[]): EnhancedSolution[] {
    return dbSolutions.map(solution => ({
      id: solution.id,
      name: solution.name,
      description: solution.description || '',
      shortDescription: solution.short_description,
      features: Array.isArray(solution.features) ? solution.features : [],
      useCases: Array.isArray(solution.use_cases) ? solution.use_cases : [],
      painPoints: Array.isArray(solution.pain_points) ? solution.pain_points : [],
      targetAudience: Array.isArray(solution.target_audience) ? solution.target_audience : [],
      category: solution.category || 'Business Solution',
      logoUrl: solution.logo_url,
      externalUrl: solution.external_url,
      resources: Array.isArray(solution.resources) ? solution.resources : [],
      tags: Array.isArray(solution.tags) ? solution.tags : [],
      benefits: Array.isArray(solution.benefits) ? solution.benefits : [],
      integrations: Array.isArray(solution.integrations) ? solution.integrations : [],
      marketData: solution.market_data || {},
      competitors: Array.isArray(solution.competitors) ? solution.competitors : [],
      technicalSpecs: solution.technical_specs || {},
      pricing: solution.pricing_model || {},
      caseStudies: Array.isArray(solution.case_studies) ? solution.case_studies : [],
      metrics: solution.metrics || {},
      uniqueValuePropositions: Array.isArray(solution.unique_value_propositions) ? solution.unique_value_propositions : [],
      positioningStatement: solution.positioning_statement,
      keyDifferentiators: Array.isArray(solution.key_differentiators) ? solution.key_differentiators : [],
      metadata: solution.metadata || {}
    }));
  }

  private transformEnhancedToDatabase(enhanced: Partial<SolutionCreateData>): any {
    return {
      name: enhanced.name,
      description: enhanced.description,
      short_description: enhanced.short_description,
      features: enhanced.features || [],
      use_cases: enhanced.use_cases || [],
      pain_points: enhanced.pain_points || [],
      target_audience: enhanced.target_audience || [],
      category: enhanced.category || 'Business Solution',
      external_url: enhanced.external_url,
      resources: enhanced.resources || [],
      tags: enhanced.tags || [],
      benefits: enhanced.benefits || [],
      integrations: enhanced.integrations || [],
      market_data: enhanced.market_data || {},
      competitors: enhanced.competitors || [],
      technical_specs: enhanced.technical_specs || {},
      pricing_model: enhanced.pricing_model || {},
      case_studies: enhanced.case_studies || [],
      metrics: enhanced.metrics || {},
      unique_value_propositions: enhanced.unique_value_propositions || [],
      positioning_statement: enhanced.positioning_statement,
      key_differentiators: enhanced.key_differentiators || [],
      metadata: enhanced.metadata || {}
    };
  }

  // Validation helpers
  validateSolutionData(data: SolutionCreateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Solution name is required');
    }

    if (data.name && data.name.length > 255) {
      errors.push('Solution name must be less than 255 characters');
    }

    if (data.external_url && !this.isValidUrl(data.external_url)) {
      errors.push('External URL must be a valid URL');
    }

    // Validate resources URLs
    if (data.resources) {
      data.resources.forEach((resource, index) => {
        if (!this.isValidUrl(resource.url)) {
          errors.push(`Resource ${index + 1} URL is invalid`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Analytics helpers
  calculateCompletenessScore(solution: EnhancedSolution): number {
    const fields = [
      'name', 'description', 'features', 'useCases', 'painPoints', 
      'targetAudience', 'category', 'resources', 'marketData',
      'competitors', 'technicalSpecs', 'pricing', 'caseStudies',
      'uniqueValuePropositions', 'keyDifferentiators'
    ];

    let filledFields = 0;
    fields.forEach(field => {
      const value = solution[field as keyof EnhancedSolution];
      if (value) {
        if (Array.isArray(value) && value.length > 0) filledFields++;
        else if (typeof value === 'object' && Object.keys(value).length > 0) filledFields++;
        else if (typeof value === 'string' && value.trim().length > 0) filledFields++;
      }
    });

    return Math.round((filledFields / fields.length) * 100);
  }

  async searchSolutions(query: string): Promise<EnhancedSolution[]> {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching solutions:', error);
        return [];
      }

      return this.transformDatabaseToEnhanced(data || []);
    } catch (error) {
      console.error('Service error searching solutions:', error);
      return [];
    }
  }
}

export const solutionService = new SolutionService();