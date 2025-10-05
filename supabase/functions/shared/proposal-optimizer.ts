/**
 * Optimize AI strategy proposals for token efficiency
 * Reduces massive SERP data bloat from ~192KB to ~50 tokens per proposal
 */

export function truncateProposal(proposal: any): any {
  if (!proposal) return proposal;
  
  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description ? proposal.description.substring(0, 200) : null,
    primary_keyword: proposal.primary_keyword,
    content_type: proposal.content_type,
    priority_tag: proposal.priority_tag,
    estimated_impressions: proposal.estimated_impressions,
    status: proposal.status,
    created_at: proposal.created_at,
    related_keywords: proposal.related_keywords?.slice(0, 5) // Only top 5 keywords
  };
}
