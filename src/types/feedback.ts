
export interface FeedbackItem {
  id?: string;
  user_id?: string;
  message: string;
  sentiment: 'positive' | 'negative';
  type: 'suggestion' | 'bug' | 'other';
  status: 'unread' | 'in-progress' | 'resolved' | 'closed';
  created_at?: string;
}
