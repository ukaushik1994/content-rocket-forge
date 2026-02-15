import { supabase } from '@/integrations/supabase/client';
import { EnhancedOffering, EnhancedOfferingResource } from '@/contexts/content-builder/types/enhanced-offering-types';
import { toast } from 'sonner';

export interface OfferingCreateData {
  name: string;
  description?: string;
  short_description?: string;
  features?: string[];
  use_cases?: string[];
  pain_points?: string[];
  target_audience?: string[];
  category?: string;
  external_url?: string;
  resources?: EnhancedOfferingResource[];
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

export interface OfferingUpdateData extends Partial<OfferingCreateData> {
  id: string;
}

// Keep backward-compatible aliases
export type SolutionCreateData = OfferingCreateData;
export type SolutionUpdateData = OfferingUpdateData;

class OfferingService {
  async getAllSolutions(): Promise<EnhancedOffering[]> {
    return this.getAllOfferings();
  }

  async getAllOfferings(): Promise<EnhancedOffering[]> {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offerings:', error);
        toast.error('Failed to load offerings');
        return [];
      }

      return this.transformDatabaseToEnhanced(data || []);
    } catch (error) {
      console.error('Service error fetching offerings:', error);
      toast.error('Failed to load offerings');
      return [];
    }
  }

  async getSolutionById(id: string): Promise<EnhancedOffering | null> {
    return this.getOfferingById(id);
  }

  async getOfferingById(id: string): Promise<EnhancedOffering | null> {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching offering:', error);
        toast.error('Failed to load offering');
        return null;
      }

      return this.transformDatabaseToEnhanced([data])[0] || null;
    } catch (error) {
      console.error('Service error fetching offering:', error);
      toast.error('Failed to load offering');
      return null;
    }
  }

  async createSolution(data: OfferingCreateData, logoFile?: File) {
    return this.createOffering(data, logoFile);
  }

  async createOffering(offeringData: OfferingCreateData, logoFile?: File): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to create an offering');
      }

      let logoUrl = null;

      if (logoFile) {
        logoUrl = await this.uploadLogo(logoFile);
        if (!logoUrl) {
          throw new Error('Failed to upload logo');
        }
      }

      const dbData = this.transformEnhancedToDatabase(offeringData);
      if (logoUrl) {
        dbData.logo_url = logoUrl;
      }
      
      dbData.user_id = user.id;

      console.log('Creating offering with data:', dbData);

      const { data, error } = await supabase
        .from('solutions')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Error creating offering:', error);
        throw new Error(`Failed to create offering: ${error.message}`);
      }

      console.log('Offering created successfully:', data);
      const transformedData = this.transformDatabaseToEnhanced([data])[0];
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Service error creating offering:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create offering';
      throw new Error(errorMessage);
    }
  }

  async updateSolution(id: string, data: Partial<OfferingCreateData>, logoFile?: File) {
    return this.updateOffering(id, data, logoFile);
  }

  async updateOffering(id: string, offeringData: Partial<OfferingCreateData>, logoFile?: File): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to update an offering');
      }

      let logoUrl = undefined;

      if (logoFile) {
        logoUrl = await this.uploadLogo(logoFile);
        if (!logoUrl) {
          throw new Error('Failed to upload logo');
        }
      }

      const dbData = this.transformEnhancedToDatabase(offeringData);
      if (logoUrl) {
        dbData.logo_url = logoUrl;
      }

      const { data, error } = await supabase
        .from('solutions')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating offering:', error);
        throw new Error(`Failed to update offering: ${error.message}`);
      }

      const transformedData = this.transformDatabaseToEnhanced([data])[0];
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Service error updating offering:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update offering';
      throw new Error(errorMessage);
    }
  }

  async deleteSolution(id: string): Promise<boolean> {
    return this.deleteOffering(id);
  }

  async deleteOffering(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('solutions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting offering:', error);
        toast.error('Failed to delete offering');
        return false;
      }

      toast.success('Offering deleted successfully');
      return true;
    } catch (error) {
      console.error('Service error deleting offering:', error);
      toast.error('Failed to delete offering');
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

  private transformDatabaseToEnhanced(dbItems: any[]): EnhancedOffering[] {
    return dbItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      shortDescription: item.short_description,
      features: Array.isArray(item.features) ? item.features : [],
      useCases: Array.isArray(item.use_cases) ? item.use_cases : [],
      painPoints: Array.isArray(item.pain_points) ? item.pain_points : [],
      targetAudience: Array.isArray(item.target_audience) ? item.target_audience : [],
      category: item.category || 'Business Offering',
      logoUrl: item.logo_url,
      externalUrl: item.external_url,
      resources: Array.isArray(item.resources) ? item.resources : [],
      tags: Array.isArray(item.tags) ? item.tags : [],
      benefits: Array.isArray(item.benefits) ? item.benefits : [],
      integrations: Array.isArray(item.integrations) ? item.integrations : [],
      marketData: item.market_data || {},
      competitors: Array.isArray(item.competitors) ? item.competitors : [],
      technicalSpecs: item.technical_specs || {},
      pricing: item.pricing_model || {
        model: 'subscription',
        tiers: []
      },
      caseStudies: Array.isArray(item.case_studies) ? item.case_studies : [],
      metrics: item.metrics || {},
      uniqueValuePropositions: Array.isArray(item.unique_value_propositions) ? item.unique_value_propositions : [],
      positioningStatement: item.positioning_statement,
      keyDifferentiators: Array.isArray(item.key_differentiators) ? item.key_differentiators : [],
      metadata: item.metadata || {}
    }));
  }

  private transformEnhancedToDatabase(enhanced: Partial<OfferingCreateData>): any {
    return {
      name: enhanced.name,
      description: enhanced.description,
      short_description: enhanced.short_description,
      features: enhanced.features || [],
      use_cases: enhanced.use_cases || [],
      pain_points: enhanced.pain_points || [],
      target_audience: enhanced.target_audience || [],
      category: enhanced.category || 'Business Offering',
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

  validateOfferingData(data: OfferingCreateData): { isValid: boolean; errors: string[] } {
    return this.validateSolutionData(data);
  }

  validateSolutionData(data: OfferingCreateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Offering name is required');
    }

    if (data.name && data.name.length > 255) {
      errors.push('Offering name must be less than 255 characters');
    }

    if (data.external_url && !this.isValidUrl(data.external_url)) {
      errors.push('External URL must be a valid URL');
    }

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

  calculateCompletenessScore(offering: EnhancedOffering): number {
    const fields = [
      'name', 'description', 'features', 'useCases', 'painPoints', 
      'targetAudience', 'category', 'resources', 'marketData',
      'competitors', 'technicalSpecs', 'pricing', 'caseStudies',
      'uniqueValuePropositions', 'keyDifferentiators'
    ];

    let filledFields = 0;
    fields.forEach(field => {
      const value = offering[field as keyof EnhancedOffering];
      if (value) {
        if (Array.isArray(value) && value.length > 0) filledFields++;
        else if (typeof value === 'object' && Object.keys(value).length > 0) filledFields++;
        else if (typeof value === 'string' && value.trim().length > 0) filledFields++;
      }
    });

    return Math.round((filledFields / fields.length) * 100);
  }

  async searchOfferings(query: string): Promise<EnhancedOffering[]> {
    return this.searchSolutions(query);
  }

  async searchSolutions(query: string): Promise<EnhancedOffering[]> {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching offerings:', error);
        return [];
      }

      return this.transformDatabaseToEnhanced(data || []);
    } catch (error) {
      console.error('Service error searching offerings:', error);
      return [];
    }
  }
}

export const offeringService = new OfferingService();
// Backward-compatible alias
export const solutionService = offeringService;
