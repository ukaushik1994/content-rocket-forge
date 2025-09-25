import { supabase } from '@/integrations/supabase/client';
import { AudienceSegment, SegmentCriteria, TargetedTest } from '@/types/ab-testing-advanced';

class AudienceSegmentService {
  private static instance: AudienceSegmentService;

  static getInstance(): AudienceSegmentService {
    if (!AudienceSegmentService.instance) {
      AudienceSegmentService.instance = new AudienceSegmentService();
    }
    return AudienceSegmentService.instance;
  }

  async createSegment(segment: Omit<AudienceSegment, 'id' | 'created_at'>): Promise<AudienceSegment | null> {
    try {
      // Store segments in local storage for now
      const segments = this.getStoredSegments();
      const newSegment: AudienceSegment = {
        id: crypto.randomUUID(),
        name: segment.name,
        criteria: segment.criteria,
        size_estimate: segment.size_estimate,
        created_at: new Date().toISOString()
      };
      segments.push(newSegment);
      localStorage.setItem('audience_segments', JSON.stringify(segments));
      return newSegment;
    } catch (error) {
      console.error('Error creating audience segment:', error);
      return null;
    }
  }

  async getSegments(): Promise<AudienceSegment[]> {
    try {
      return this.getStoredSegments();
    } catch (error) {
      console.error('Error fetching audience segments:', error);
      return [];
    }
  }

  private getStoredSegments(): AudienceSegment[] {
    try {
      const stored = localStorage.getItem('audience_segments');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async updateSegment(segmentId: string, updates: Partial<AudienceSegment>): Promise<boolean> {
    try {
      const segments = this.getStoredSegments();
      const index = segments.findIndex(s => s.id === segmentId);
      if (index >= 0) {
        segments[index] = { ...segments[index], ...updates };
        localStorage.setItem('audience_segments', JSON.stringify(segments));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating audience segment:', error);
      return false;
    }
  }

  async deleteSegment(segmentId: string): Promise<boolean> {
    try {
      const segments = this.getStoredSegments();
      const filtered = segments.filter(s => s.id !== segmentId);
      localStorage.setItem('audience_segments', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting audience segment:', error);
      return false;
    }
  }

  async evaluateUserForSegment(segmentId: string, userAttributes: Record<string, any>): Promise<boolean> {
    try {
      const segments = this.getStoredSegments();
      const segment = segments.find(s => s.id === segmentId);
      if (!segment) return false;
      return this.matchesCriteria(userAttributes, segment.criteria);
    } catch (error) {
      console.error('Error evaluating user for segment:', error);
      return false;
    }
  }

  private matchesCriteria(userAttributes: Record<string, any>, criteria: SegmentCriteria[]): boolean {
    return criteria.every(criterion => {
      const userValue = userAttributes[criterion.field];
      
      switch (criterion.operator) {
        case 'equals':
          return userValue === criterion.value;
        case 'contains':
          return String(userValue).includes(String(criterion.value));
        case 'greater_than':
          return Number(userValue) > Number(criterion.value);
        case 'less_than':
          return Number(userValue) < Number(criterion.value);
        case 'in':
          return Array.isArray(criterion.value) && criterion.value.includes(userValue);
        case 'not_in':
          return Array.isArray(criterion.value) && !criterion.value.includes(userValue);
        default:
          return false;
      }
    });
  }

  async getSegmentedTestResults(testId: string): Promise<Record<string, any>> {
    try {
      // Mock segmented results for now
      return {
        'segment-1': {
          assignments: 100,
          conversions: 15,
          conversion_rate: 0.15,
          events: []
        },
        'segment-2': {
          assignments: 150,
          conversions: 30,
          conversion_rate: 0.20,
          events: []
        }
      };
    } catch (error) {
      console.error('Error getting segmented test results:', error);
      return {};
    }
  }

  async createTargetedTest(testData: Omit<TargetedTest, 'id' | 'created_at'>): Promise<TargetedTest | null> {
    try {
      // Simplified targeted test creation using existing ab_tests structure
      const testId = crypto.randomUUID();
      const targetedTest: TargetedTest = {
        ...testData,
        id: testId,
        created_at: new Date().toISOString(),
        audience_segments: testData.audience_segments || [],
        segment_performance: {}
      };
      return targetedTest;
    } catch (error) {
      console.error('Error creating targeted test:', error);
      return null;
    }
  }

  async estimateSegmentSize(criteria: SegmentCriteria[]): Promise<number> {
    try {
      // This would typically query user analytics data
      // For now, return a mock estimate based on criteria complexity
      const baseSize = 10000;
      const complexityFactor = criteria.length * 0.2;
      return Math.floor(baseSize * (1 - complexityFactor));
    } catch (error) {
      console.error('Error estimating segment size:', error);
      return 0;
    }
  }

  async getUserSegments(userId: string): Promise<string[]> {
    try {
      // Use localStorage for user segments
      const userSegments = localStorage.getItem(`user_segments_${userId}`);
      return userSegments ? JSON.parse(userSegments) : [];
    } catch (error) {
      console.error('Error getting user segments:', error);
      return [];
    }
  }

  async assignUserToSegments(userId: string, segmentIds: string[]): Promise<boolean> {
    try {
      localStorage.setItem(`user_segments_${userId}`, JSON.stringify(segmentIds));
      return true;
    } catch (error) {
      console.error('Error assigning user to segments:', error);
      return false;
    }
  }
}

export const audienceSegmentService = AudienceSegmentService.getInstance();