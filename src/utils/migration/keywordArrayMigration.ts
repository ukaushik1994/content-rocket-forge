import { supabase } from '@/integrations/supabase/client';

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  details: Array<{
    id: string;
    title: string;
    extractedKeywords: string[];
    status: 'success' | 'error';
    error?: string;
  }>;
}

/**
 * Extract keyword string from various formats
 * Handles: {"keyword":"text"}, "text", or just text
 */
function extractKeywordString(keywordData: any): string | null {
  if (!keywordData) return null;
  
  // If it's already a string
  if (typeof keywordData === 'string') {
    // Try to parse if it looks like JSON
    if (keywordData.startsWith('{')) {
      try {
        const parsed = JSON.parse(keywordData);
        return parsed.keyword || keywordData;
      } catch {
        return keywordData;
      }
    }
    return keywordData;
  }
  
  // If it's an object with keyword property
  if (typeof keywordData === 'object' && keywordData.keyword) {
    return keywordData.keyword;
  }
  
  return null;
}

/**
 * One-time migration to populate keywords array from metadata
 */
export async function migrateKeywordsToArray(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
    details: []
  };

  try {
    console.log('🔍 Starting keyword array migration...');

    // Fetch content items where keywords array is empty but metadata exists
    const { data: contentItems, error: fetchError } = await supabase
      .from('content_items')
      .select('id, title, metadata, keywords')
      .or('keywords.is.null,keywords.eq.{}');

    if (fetchError) {
      throw new Error(`Failed to fetch content items: ${fetchError.message}`);
    }

    if (!contentItems || contentItems.length === 0) {
      console.log('✅ No content items need migration');
      return result;
    }

    console.log(`📊 Found ${contentItems.length} items to check`);

    // Process each content item
    for (const item of contentItems) {
      const detail: {
        id: string;
        title: string;
        extractedKeywords: string[];
        status: 'success' | 'error';
        error?: string;
      } = {
        id: item.id,
        title: item.title || 'Untitled',
        extractedKeywords: [],
        status: 'success'
      };

      try {
        const metadata = item.metadata as any;
        const keywords: string[] = [];

        // Extract main keyword
        if (metadata?.mainKeyword) {
          const mainKeyword = extractKeywordString(metadata.mainKeyword);
          if (mainKeyword) {
            keywords.push(mainKeyword);
          }
        }

        // Extract secondary keywords
        if (metadata?.secondaryKeywords && Array.isArray(metadata.secondaryKeywords)) {
          for (const sk of metadata.secondaryKeywords) {
            const keyword = extractKeywordString(sk);
            if (keyword && !keywords.includes(keyword)) {
              keywords.push(keyword);
            }
          }
        }

        detail.extractedKeywords = keywords;

        // Only update if we found keywords
        if (keywords.length > 0) {
          const { error: updateError } = await supabase
            .from('content_items')
            .update({ keywords })
            .eq('id', item.id);

          if (updateError) {
            throw new Error(`Update failed: ${updateError.message}`);
          }

          result.migratedCount++;
          console.log(`✅ Migrated: "${item.title}" - Keywords: ${keywords.join(', ')}`);
        } else {
          console.log(`⚠️ No keywords found in metadata for: "${item.title}"`);
        }

        result.details.push(detail);

      } catch (error) {
        detail.status = 'error';
        detail.error = error instanceof Error ? error.message : String(error);
        result.errors.push(`${item.title}: ${detail.error}`);
        result.success = false;
        result.details.push(detail);
        console.error(`❌ Error migrating "${item.title}":`, error);
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${result.migratedCount}`);
    console.log(`   ❌ Errors: ${result.errors.length}`);

  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMessage);
    console.error('❌ Migration failed:', error);
  }

  return result;
}

/**
 * Verify migration results
 */
export async function verifyKeywordMigration(): Promise<{
  totalItems: number;
  itemsWithKeywords: number;
  itemsWithoutKeywords: number;
}> {
  const { data: allItems } = await supabase
    .from('content_items')
    .select('id, keywords');

  const total = allItems?.length || 0;
  const withKeywords = allItems?.filter(item => 
    item.keywords && Array.isArray(item.keywords) && item.keywords.length > 0
  ).length || 0;

  return {
    totalItems: total,
    itemsWithKeywords: withKeywords,
    itemsWithoutKeywords: total - withKeywords
  };
}
