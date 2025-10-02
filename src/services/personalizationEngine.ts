/**
 * Personalization Engine
 * Manages user-specific AI adaptations and personalized experiences
 */

import { supabase } from '@/integrations/supabase/client';

export interface PersonalizationProfile {
  userId: string;
  aiPersonality: 'professional' | 'friendly' | 'concise' | 'detailed';
  preferredContentTypes: string[];
  learningStyle: 'visual' | 'textual' | 'hands-on' | 'balanced';
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  automationPreference: 'manual' | 'balanced' | 'automated';
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  relevanceScore: number;
  actionUrl?: string;
}

export class PersonalizationEngine {
  /**
   * Get or create user's personalization profile
   */
  async getPersonalizationProfile(userId: string): Promise<PersonalizationProfile | null> {
    try {
      const { data, error } = await supabase
        .from('personalization_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create default profile
        const { data: newProfile } = await supabase
          .from('personalization_profiles')
          .insert({
            user_id: userId,
            ai_personality_preference: 'professional',
            learning_style: 'balanced',
            expertise_level: 'intermediate',
            automation_preference: 'balanced'
          })
          .select()
          .single();

        return newProfile ? this.mapToProfile(newProfile) : null;
      }

      return this.mapToProfile(data);
    } catch (error) {
      console.error('Error getting personalization profile:', error);
      return null;
    }
  }

  /**
   * Update personalization profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<PersonalizationProfile>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personalization_profiles')
        .update({
          ai_personality_preference: updates.aiPersonality,
          preferred_content_types: updates.preferredContentTypes,
          learning_style: updates.learningStyle,
          expertise_level: updates.expertiseLevel,
          automation_preference: updates.automationPreference
        })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error updating personalization profile:', error);
      return false;
    }
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(
    userId: string,
    type: 'content_topic' | 'workflow' | 'feature' | 'learning'
  ): Promise<Recommendation[]> {
    try {
      // Check cache first
      const { data: cached } = await supabase
        .from('recommendation_cache')
        .select('*')
        .eq('user_id', userId)
        .eq('recommendation_type', type)
        .gt('cache_expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cached?.recommendations) {
        try {
          const recs = Array.isArray(cached.recommendations) 
            ? cached.recommendations 
            : [];
          return recs as unknown as Recommendation[];
        } catch {
          return [];
        }
      }

      // Generate new recommendations based on behavior patterns
      const { data: behaviorPatterns } = await supabase
        .from('user_behavior_patterns')
        .select('*')
        .eq('user_id', userId)
        .order('importance_score', { ascending: false })
        .limit(10);

      const { data: profile } = await supabase
        .from('personalization_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const recommendations = await this.buildRecommendations(
        type,
        behaviorPatterns || [],
        profile
      );

      // Cache recommendations
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await supabase.from('recommendation_cache').insert({
        user_id: userId,
        recommendation_type: type,
        recommendations: recommendations as any,
        generation_method: 'behavior_based',
        cache_expires_at: expiresAt.toISOString(),
        personalization_factors: ['behavior_patterns', 'user_profile'] as any
      });

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Track user behavior for personalization
   */
  async trackBehavior(
    userId: string,
    patternType: string,
    patternData: Record<string, any>
  ): Promise<void> {
    try {
      // Check if pattern exists
      const { data: existing } = await supabase
        .from('user_behavior_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('pattern_type', patternType)
        .single();

      if (existing) {
        // Update existing pattern
        const existingData = typeof existing.pattern_data === 'object' && existing.pattern_data !== null
          ? existing.pattern_data as Record<string, any>
          : {};
        
        await supabase
          .from('user_behavior_patterns')
          .update({
            pattern_data: {
              ...existingData,
              ...patternData
            } as any,
            frequency_score: (existing.frequency_score || 0) + 1,
            recency_score: 1.0,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new pattern
        await supabase.from('user_behavior_patterns').insert({
          user_id: userId,
          pattern_type: patternType,
          pattern_data: patternData as any,
          frequency_score: 1,
          recency_score: 1.0,
          importance_score: 0.5
        });
      }
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  }

  /**
   * Get adaptive UI preferences
   */
  async getUIPreferences(userId: string): Promise<{
    layout: string;
    favoriteFeatures: string[];
    quickAccessItems: string[];
  }> {
    try {
      const { data } = await supabase
        .from('adaptive_ui_state')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!data) {
        // Create default UI state
        const { data: newState } = await supabase
          .from('adaptive_ui_state')
          .insert({
            user_id: userId,
            preferred_layout: 'default',
            favorite_features: [],
            quick_access_items: []
          })
          .select()
          .single();

        const favoriteFeatures = Array.isArray(newState?.favorite_features)
          ? newState.favorite_features as string[]
          : [];
        const quickAccessItems = Array.isArray(newState?.quick_access_items)
          ? newState.quick_access_items as string[]
          : [];

        return {
          layout: newState?.preferred_layout || 'default',
          favoriteFeatures,
          quickAccessItems
        };
      }

      const favoriteFeatures = Array.isArray(data.favorite_features) 
        ? data.favorite_features as string[]
        : [];
      const quickAccessItems = Array.isArray(data.quick_access_items)
        ? data.quick_access_items as string[]
        : [];

      return {
        layout: data.preferred_layout || 'default',
        favoriteFeatures,
        quickAccessItems
      };
    } catch (error) {
      console.error('Error getting UI preferences:', error);
      return {
        layout: 'default',
        favoriteFeatures: [],
        quickAccessItems: []
      };
    }
  }

  /**
   * Update UI preferences
   */
  async updateUIPreferences(
    userId: string,
    preferences: {
      layout?: string;
      favoriteFeatures?: string[];
      quickAccessItems?: string[];
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('adaptive_ui_state')
        .upsert({
          user_id: userId,
          preferred_layout: preferences.layout,
          favorite_features: preferences.favoriteFeatures as any,
          quick_access_items: preferences.quickAccessItems as any,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Error updating UI preferences:', error);
      return false;
    }
  }

  /**
   * Get personalized AI system prompt
   */
  getPersonalizedPrompt(profile: PersonalizationProfile | null): string {
    if (!profile) {
      return 'You are a helpful AI assistant for content strategy and creation.';
    }

    let prompt = 'You are a helpful AI assistant for content strategy and creation. ';

    // Adjust based on AI personality
    switch (profile.aiPersonality) {
      case 'friendly':
        prompt += 'Be warm, encouraging, and conversational. Use friendly language. ';
        break;
      case 'concise':
        prompt += 'Be brief and to the point. Focus on actionable insights. ';
        break;
      case 'detailed':
        prompt += 'Provide comprehensive explanations with examples and context. ';
        break;
      default:
        prompt += 'Maintain a professional and helpful tone. ';
    }

    // Adjust based on expertise level
    switch (profile.expertiseLevel) {
      case 'beginner':
        prompt += 'Explain concepts clearly with basic terminology. ';
        break;
      case 'advanced':
      case 'expert':
        prompt += 'Use advanced terminology and assume deep knowledge. ';
        break;
      default:
        prompt += 'Balance between clarity and technical depth. ';
    }

    // Adjust based on learning style
    if (profile.learningStyle === 'visual') {
      prompt += 'Suggest visual representations when appropriate. ';
    } else if (profile.learningStyle === 'hands-on') {
      prompt += 'Provide practical, actionable steps and examples. ';
    }

    return prompt;
  }

  // Private helper methods
  private mapToProfile(data: any): PersonalizationProfile {
    return {
      userId: data.user_id,
      aiPersonality: data.ai_personality_preference || 'professional',
      preferredContentTypes: data.preferred_content_types || [],
      learningStyle: data.learning_style || 'balanced',
      expertiseLevel: data.expertise_level || 'intermediate',
      automationPreference: data.automation_preference || 'balanced'
    };
  }

  private async buildRecommendations(
    type: string,
    patterns: any[],
    profile: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    if (type === 'content_topic') {
      // Analyze frequently used topics
      const contentPatterns = patterns.filter(p => p.pattern_type === 'content_creation');
      
      recommendations.push({
        id: '1',
        type: 'content_topic',
        title: 'Explore Trending Topics',
        description: 'Based on your recent content, these topics are performing well',
        relevanceScore: 0.85
      });
    } else if (type === 'workflow') {
      recommendations.push({
        id: '2',
        type: 'workflow',
        title: 'Optimize Content Workflow',
        description: 'Automate repetitive tasks in your content creation process',
        relevanceScore: 0.78
      });
    } else if (type === 'feature') {
      recommendations.push({
        id: '3',
        type: 'feature',
        title: 'Try AI-Powered Analytics',
        description: 'Get predictive insights on your content performance',
        relevanceScore: 0.92
      });
    }

    return recommendations;
  }
}

export const personalizationEngine = new PersonalizationEngine();
