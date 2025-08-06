import { supabase } from '@/integrations/supabase/client';
import { Solution } from '@/contexts/content-builder/types/solution-types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { toast } from 'sonner';

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
}

export class SolutionDataMigration {
  /**
   * Migrates basic solution data to enhanced solution format
   */
  static async migrateBasicToEnhanced(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedCount: 0,
      errors: []
    };

    try {
      // Get all solutions that need migration (those without enhanced fields)
      const { data: solutions, error: fetchError } = await supabase
        .from('solutions')
        .select('*')
        .is('description', null);

      if (fetchError) {
        result.errors.push(`Failed to fetch solutions: ${fetchError.message}`);
        return result;
      }

      if (!solutions || solutions.length === 0) {
        result.success = true;
        toast.info('No solutions need migration');
        return result;
      }

      // Migrate each solution
      for (const solution of solutions) {
        try {
          const migrationData = this.createMigrationData(solution);
          
          const { error: updateError } = await supabase
            .from('solutions')
            .update(migrationData)
            .eq('id', solution.id);

          if (updateError) {
            result.errors.push(`Failed to migrate solution ${solution.name}: ${updateError.message}`);
          } else {
            result.migratedCount++;
          }
        } catch (error) {
          result.errors.push(`Error migrating solution ${solution.name}: ${error}`);
        }
      }

      result.success = result.errors.length === 0;
      
      if (result.success) {
        toast.success(`Successfully migrated ${result.migratedCount} solutions`);
      } else {
        toast.error(`Migration completed with ${result.errors.length} errors`);
      }

      return result;
    } catch (error) {
      result.errors.push(`Migration failed: ${error}`);
      toast.error('Migration failed');
      return result;
    }
  }

  /**
   * Creates enhanced migration data from basic solution data
   */
  private static createMigrationData(basicSolution: any): any {
    return {
      description: basicSolution.name ? `Comprehensive ${basicSolution.name} solution` : '',
      short_description: basicSolution.name ? `${basicSolution.name} - Business Solution` : '',
      tags: ['migrated', 'legacy'],
      benefits: [],
      integrations: [],
      market_data: {
        size: null,
        growthRate: null,
        geographicAvailability: [],
        complianceRequirements: []
      },
      competitors: [],
      technical_specs: {
        systemRequirements: [],
        supportedPlatforms: [],
        apiCapabilities: [],
        securityFeatures: [],
        performanceMetrics: [],
        uptimeGuarantee: null
      },
      pricing_model: {
        model: 'custom',
        startingPrice: null,
        tiers: [],
        customPricing: true,
        freeTrialDuration: null
      },
      case_studies: [],
      metrics: {
        adoptionRate: null,
        customerSatisfaction: null,
        roi: null,
        implementationTime: null,
        supportResponse: null,
        usageAnalytics: []
      },
      unique_value_propositions: [],
      positioning_statement: null,
      key_differentiators: [],
      metadata: {
        websiteTitle: null,
        websiteDescription: null,
        favicon: null,
        lastUpdated: new Date().toISOString(),
        completeness: 25 // Basic completion score for migrated data
      }
    };
  }

  /**
   * Validates migrated data integrity
   */
  static async validateMigration(): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      const { data: solutions, error } = await supabase
        .from('solutions')
        .select('*');

      if (error) {
        issues.push(`Failed to fetch solutions for validation: ${error.message}`);
        return { isValid: false, issues };
      }

      for (const solution of solutions || []) {
        // Check required fields
        if (!solution.name) {
          issues.push(`Solution ${solution.id} missing name`);
        }

        // Check JSONB fields are valid
        try {
          if (solution.features && typeof solution.features !== 'object') {
            issues.push(`Solution ${solution.name} has invalid features format`);
          }
          if (solution.market_data && typeof solution.market_data !== 'object') {
            issues.push(`Solution ${solution.name} has invalid market_data format`);
          }
          if (solution.technical_specs && typeof solution.technical_specs !== 'object') {
            issues.push(`Solution ${solution.name} has invalid technical_specs format`);
          }
        } catch (error) {
          issues.push(`Solution ${solution.name} has corrupted JSON data`);
        }

        // Check URL validity
        if (solution.external_url && !this.isValidUrl(solution.external_url)) {
          issues.push(`Solution ${solution.name} has invalid external URL`);
        }

        // Check resources URLs
        if (solution.resources && Array.isArray(solution.resources)) {
          solution.resources.forEach((resource: any, index: number) => {
            if (resource.url && !this.isValidUrl(resource.url)) {
              issues.push(`Solution ${solution.name} resource ${index + 1} has invalid URL`);
            }
          });
        }
      }

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push(`Validation failed: ${error}`);
      return { isValid: false, issues };
    }
  }

  /**
   * Creates backup of solution data before migration
   */
  static async createBackup(): Promise<boolean> {
    try {
      const { data: solutions, error } = await supabase
        .from('solutions')
        .select('*');

      if (error) {
        toast.error(`Failed to create backup: ${error.message}`);
        return false;
      }

      // Store backup in browser localStorage as JSON
      const backup = {
        timestamp: new Date().toISOString(),
        solutions: solutions || []
      };

      localStorage.setItem('solutions_backup', JSON.stringify(backup));
      toast.success('Backup created successfully');
      return true;
    } catch (error) {
      toast.error(`Failed to create backup: ${error}`);
      return false;
    }
  }

  /**
   * Restores solution data from backup
   */
  static async restoreFromBackup(): Promise<boolean> {
    try {
      const backupData = localStorage.getItem('solutions_backup');
      if (!backupData) {
        toast.error('No backup found');
        return false;
      }

      const backup = JSON.parse(backupData);
      if (!backup.solutions || !Array.isArray(backup.solutions)) {
        toast.error('Invalid backup format');
        return false;
      }

      // Clear existing solutions
      const { error: deleteError } = await supabase
        .from('solutions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        toast.error(`Failed to clear existing data: ${deleteError.message}`);
        return false;
      }

      // Restore solutions
      const { error: insertError } = await supabase
        .from('solutions')
        .insert(backup.solutions);

      if (insertError) {
        toast.error(`Failed to restore data: ${insertError.message}`);
        return false;
      }

      toast.success('Data restored successfully');
      return true;
    } catch (error) {
      toast.error(`Failed to restore backup: ${error}`);
      return false;
    }
  }

  private static isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Calculates completion score for a solution
   */
  static calculateCompletionScore(solution: any): number {
    const fields = [
      { key: 'name', weight: 10 },
      { key: 'description', weight: 10 },
      { key: 'features', weight: 10 },
      { key: 'use_cases', weight: 10 },
      { key: 'pain_points', weight: 10 },
      { key: 'target_audience', weight: 10 },
      { key: 'category', weight: 5 },
      { key: 'resources', weight: 10 },
      { key: 'market_data', weight: 10 },
      { key: 'competitors', weight: 5 },
      { key: 'technical_specs', weight: 10 },
      { key: 'pricing_model', weight: 10 }
    ];

    let score = 0;
    fields.forEach(field => {
      const value = solution[field.key];
      let hasValue = false;

      if (typeof value === 'string' && value.trim().length > 0) {
        hasValue = true;
      } else if (Array.isArray(value) && value.length > 0) {
        hasValue = true;
      } else if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
        hasValue = true;
      }

      if (hasValue) {
        score += field.weight;
      }
    });

    return score;
  }
}