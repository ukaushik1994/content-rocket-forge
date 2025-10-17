/**
 * Backfill script to populate missing meta_title and meta_description
 * for existing content in the repository
 */

import { supabase } from '@/integrations/supabase/client';
import { extractTitleFromContent } from '@/utils/content/extractTitle';

export async function backfillMetaInformation() {
  console.log('[Backfill] Starting meta information backfill...');
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch all content items where meta information is missing
    const { data: contentItems, error: fetchError } = await supabase
      .from('content_items')
      .select('id, title, content, meta_title, meta_description')
      .eq('user_id', user.id)
      .or('meta_title.is.null,meta_description.is.null');

    if (fetchError) {
      throw fetchError;
    }

    if (!contentItems || contentItems.length === 0) {
      console.log('[Backfill] No content items need backfilling');
      return { updated: 0, skipped: 0 };
    }

    console.log(`[Backfill] Found ${contentItems.length} items to process`);

    let updated = 0;
    let skipped = 0;

    // Process each item
    for (const item of contentItems) {
      try {
        const updates: any = {};
        let needsUpdate = false;

        // Generate meta_title if missing
        if (!item.meta_title && item.content) {
          const extractedTitle = extractTitleFromContent(item.content);
          updates.meta_title = extractedTitle || item.title;
          needsUpdate = true;
          console.log(`[Backfill] Generated meta_title for ${item.id}:`, updates.meta_title);
        }

        // Generate meta_description if missing
        if (!item.meta_description && item.content) {
          // Extract first paragraph or first 155 characters
          const contentWithoutMarkdown = item.content
            .replace(/^#+ .*$/gm, '') // Remove headings
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
            .trim();
          
          const firstParagraph = contentWithoutMarkdown.split('\n\n')[0];
          let description = firstParagraph && firstParagraph.length > 20 
            ? firstParagraph 
            : contentWithoutMarkdown.substring(0, 155);
          
          // Ensure it doesn't exceed 160 characters
          if (description.length > 160) {
            description = description.substring(0, 157) + '...';
          }
          
          updates.meta_description = description;
          needsUpdate = true;
          console.log(`[Backfill] Generated meta_description for ${item.id}`);
        }

        // Update the database if needed
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('content_items')
            .update(updates)
            .eq('id', item.id);

          if (updateError) {
            console.error(`[Backfill] Error updating ${item.id}:`, updateError);
            skipped++;
          } else {
            updated++;
          }
        } else {
          skipped++;
        }
      } catch (itemError) {
        console.error(`[Backfill] Error processing item ${item.id}:`, itemError);
        skipped++;
      }
    }

    console.log(`[Backfill] Complete: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped, total: contentItems.length };
  } catch (error) {
    console.error('[Backfill] Fatal error:', error);
    throw error;
  }
}

// Auto-run on import in development
if (import.meta.env.DEV) {
  console.log('[Backfill] Script loaded. Call backfillMetaInformation() to run.');
}
