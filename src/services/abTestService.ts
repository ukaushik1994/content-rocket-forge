import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface ABTest {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  test_type: 'content' | 'ui' | 'serp' | 'cta' | 'layout';
  target_metric: string;
  confidence_level: number;
  minimum_sample_size: number;
  traffic_allocation: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  variants?: ABTestVariant[];
}

export interface ABTestVariant {
  id: string;
  test_id: string;
  name: string;
  description?: string;
  is_control: boolean;
  traffic_weight: number;
  content_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ABTestAssignment {
  id: string;
  test_id: string;
  variant_id: string;
  user_id?: string;
  session_id?: string;
  ip_hash?: string;
  assigned_at: string;
  user_agent_hash?: string;
  metadata: Record<string, any>;
}

export interface ABTestEvent {
  id: string;
  test_id: string;
  variant_id: string;
  assignment_id: string;
  event_type: string;
  event_value?: number;
  event_metadata: Record<string, any>;
  created_at: string;
  user_id?: string;
  session_id?: string;
}

export class ABTestService {
  private static instance: ABTestService;
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  static getInstance(): ABTestService {
    if (!ABTestService.instance) {
      ABTestService.instance = new ABTestService();
    }
    return ABTestService.instance;
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('ab_test_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('ab_test_session_id', sessionId);
    }
    return sessionId;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  // Test Management
  async createTest(test: Omit<ABTest, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ABTest | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ab_tests')
        .insert({
          ...test,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as ABTest;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      return null;
    }
  }

  async getTest(testId: string): Promise<ABTest | null> {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select(`
          *,
          variants:ab_test_variants(*)
        `)
        .eq('id', testId)
        .single();

      if (error) throw error;
      return data as ABTest;
    } catch (error) {
      console.error('Error fetching A/B test:', error);
      return null;
    }
  }

  async getUserTests(): Promise<ABTest[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('ab_tests')
        .select(`
          *,
          variants:ab_test_variants(*)
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ABTest[];
    } catch (error) {
      console.error('Error fetching user A/B tests:', error);
      return [];
    }
  }

  async updateTest(testId: string, updates: Partial<ABTest>): Promise<ABTest | null> {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .update(updates)
        .eq('id', testId)
        .select()
        .single();

      if (error) throw error;
      return data as ABTest;
    } catch (error) {
      console.error('Error updating A/B test:', error);
      return null;
    }
  }

  async deleteTest(testId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting A/B test:', error);
      return false;
    }
  }

  // Variant Management
  async createVariant(variant: Omit<ABTestVariant, 'id' | 'created_at' | 'updated_at'>): Promise<ABTestVariant | null> {
    try {
      const { data, error } = await supabase
        .from('ab_test_variants')
        .insert(variant)
        .select()
        .single();

      if (error) throw error;
      return data as ABTestVariant;
    } catch (error) {
      console.error('Error creating A/B test variant:', error);
      return null;
    }
  }

  async getTestVariants(testId: string): Promise<ABTestVariant[]> {
    try {
      const { data, error } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('test_id', testId)
        .order('created_at');

      if (error) throw error;
      return (data || []) as ABTestVariant[];
    } catch (error) {
      console.error('Error fetching A/B test variants:', error);
      return [];
    }
  }

  // Assignment Logic
  async getVariantAssignment(testId: string): Promise<ABTestVariant | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Check for existing assignment
      let assignment: ABTestAssignment | null = null;
      
      if (user.user) {
        const { data } = await supabase
          .from('ab_test_assignments')
          .select('*')
          .eq('test_id', testId)
          .eq('user_id', user.user.id)
          .single();
        assignment = data as ABTestAssignment;
      }

      if (!assignment) {
        const { data } = await supabase
          .from('ab_test_assignments')
          .select('*')
          .eq('test_id', testId)
          .eq('session_id', this.sessionId)
          .single();
        assignment = data as ABTestAssignment;
      }

      if (assignment) {
        // Return existing variant
        const { data: variant } = await supabase
          .from('ab_test_variants')
          .select('*')
          .eq('id', assignment.variant_id)
          .single();
        return variant as ABTestVariant;
      }

      // Create new assignment
      const variants = await this.getTestVariants(testId);
      if (variants.length === 0) return null;

      const selectedVariant = this.selectVariantByWeight(variants);
      
      // Create assignment record
      await supabase.from('ab_test_assignments').insert({
        test_id: testId,
        variant_id: selectedVariant.id,
        user_id: user.user?.id,
        session_id: this.sessionId,
        ip_hash: this.hashString(navigator.userAgent + (new Date()).toDateString()),
        user_agent_hash: this.hashString(navigator.userAgent)
      });

      return selectedVariant;
    } catch (error) {
      console.error('Error getting variant assignment:', error);
      return null;
    }
  }

  private selectVariantByWeight(variants: ABTestVariant[]): ABTestVariant {
    const random = Math.random();
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.traffic_weight;
      if (random <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }

  // Event Tracking
  async trackEvent(
    testId: string,
    eventType: string,
    eventValue?: number,
    eventMetadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Get assignment
      const assignment = await this.getAssignment(testId, user.user?.id, this.sessionId);
      if (!assignment) return false;

      await supabase.from('ab_test_events').insert({
        test_id: testId,
        variant_id: assignment.variant_id,
        assignment_id: assignment.id,
        event_type: eventType,
        event_value: eventValue,
        event_metadata: eventMetadata,
        user_id: user.user?.id,
        session_id: this.sessionId
      });

      return true;
    } catch (error) {
      console.error('Error tracking A/B test event:', error);
      return false;
    }
  }

  private async getAssignment(testId: string, userId?: string, sessionId?: string): Promise<ABTestAssignment | null> {
    try {
      let query = supabase.from('ab_test_assignments').select('*').eq('test_id', testId);

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        return null;
      }

      const { data } = await query.single();
      return data as ABTestAssignment;
    } catch (error) {
      return null;
    }
  }

  // Test Status Management
  async startTest(testId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ 
          status: 'active',
          started_at: new Date().toISOString() 
        })
        .eq('id', testId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error starting A/B test:', error);
      return false;
    }
  }

  async pauseTest(testId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ status: 'paused' })
        .eq('id', testId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error pausing A/B test:', error);
      return false;
    }
  }

  async completeTest(testId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ab_tests')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString() 
        })
        .eq('id', testId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing A/B test:', error);
      return false;
    }
  }
}

export const abTestService = ABTestService.getInstance();