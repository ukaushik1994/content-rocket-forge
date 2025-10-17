import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

class ProposalMigrationService {
  private hasRunMigration = false;

  /**
   * Migrate proposals from ai_strategies.proposals to ai_strategy_proposals table
   * This is idempotent - safe to run multiple times
   */
  async migrateHistoricalProposals(): Promise<{ migrated: number; skipped: number }> {
    // Prevent multiple concurrent migrations
    if (this.hasRunMigration) {
      console.log('Migration already completed in this session');
      return { migrated: 0, skipped: 0 };
    }

    try {
      console.log('🔄 Starting proposal migration...');

      const { data, error } = await supabase.functions.invoke('migrate-strategy-proposals');

      if (error) {
        console.error('❌ Migration failed:', error);
        throw error;
      }

      if (data?.success) {
        this.hasRunMigration = true;
        console.log('✅ Migration completed:', data);
        
        if (data.migrated > 0) {
          toast.success(`Recovered ${data.migrated} hidden proposal${data.migrated > 1 ? 's' : ''}`, {
            description: data.skipped > 0 ? `${data.skipped} already existed` : undefined
          });
        }

        return {
          migrated: data.migrated || 0,
          skipped: data.skipped || 0
        };
      }

      throw new Error(data?.error || 'Migration failed without error message');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

  /**
   * Check if migration is needed by querying for ai_strategies with proposals
   */
  async needsMigration(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ai_strategies')
        .select('id, proposals')
        .not('proposals', 'eq', '[]')
        .not('proposals', 'is', null)
        .limit(1);

      if (error) {
        console.error('Error checking migration status:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }
}

export const proposalMigrationService = new ProposalMigrationService();
