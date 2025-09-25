import { supabase } from '@/integrations/supabase/client';
import { ABTest, ABTestVariant } from './abTestService';

export interface ABTestResults {
  id: string;
  test_id: string;
  variant_id: string;
  metric_name: string;
  sample_size: number;
  conversion_count: number;
  conversion_rate: number;
  confidence_interval?: {
    lower: number;
    upper: number;
  };
  statistical_significance?: number;
  p_value?: number;
  calculated_at: string;
  metadata: Record<string, any>;
}

export interface TestAnalysis {
  test: ABTest;
  variants: VariantAnalysis[];
  winner?: string;
  confidence: number;
  recommendation: string;
  statistical_significance: boolean;
}

export interface VariantAnalysis {
  variant: ABTestVariant;
  results: ABTestResults[];
  performance: {
    sample_size: number;
    conversion_rate: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
    lift?: number;
    significance?: number;
  };
}

export class ABTestAnalyticsService {
  private static instance: ABTestAnalyticsService;

  static getInstance(): ABTestAnalyticsService {
    if (!ABTestAnalyticsService.instance) {
      ABTestAnalyticsService.instance = new ABTestAnalyticsService();
    }
    return ABTestAnalyticsService.instance;
  }

  // Calculate conversion rates and statistical significance
  async calculateTestResults(testId: string, metricName: string = 'conversion'): Promise<TestAnalysis | null> {
    try {
      const test = await this.getTest(testId);
      if (!test) return null;

      const variants = await this.getTestVariants(testId);
      const variantAnalyses: VariantAnalysis[] = [];
      
      for (const variant of variants) {
        const analysis = await this.analyzeVariant(testId, variant.id, metricName);
        if (analysis) {
          variantAnalyses.push({
            variant,
            results: [analysis],
            performance: {
              sample_size: analysis.sample_size,
              conversion_rate: analysis.conversion_rate,
              confidence_interval: analysis.confidence_interval || { lower: 0, upper: 0 }
            }
          });
        }
      }

      // Find control variant
      const controlVariant = variantAnalyses.find(v => v.variant.is_control);
      
      // Calculate lift and significance for non-control variants
      if (controlVariant) {
        for (const variantAnalysis of variantAnalyses) {
          if (!variantAnalysis.variant.is_control) {
            const lift = this.calculateLift(
              controlVariant.performance.conversion_rate,
              variantAnalysis.performance.conversion_rate
            );
            
            const significance = await this.calculateStatisticalSignificance(
              controlVariant.performance.sample_size,
              controlVariant.performance.conversion_rate,
              variantAnalysis.performance.sample_size,
              variantAnalysis.performance.conversion_rate
            );

            variantAnalysis.performance.lift = lift;
            variantAnalysis.performance.significance = significance.p_value;
          }
        }
      }

      // Determine winner and recommendation
      const winner = this.determineWinner(variantAnalyses);
      const recommendation = this.generateRecommendation(variantAnalyses, test);

      return {
        test,
        variants: variantAnalyses,
        winner: winner?.variant.id,
        confidence: Math.max(...variantAnalyses.map(v => v.performance.significance || 0)),
        recommendation,
        statistical_significance: variantAnalyses.some(v => (v.performance.significance || 1) < 0.05)
      };
    } catch (error) {
      console.error('Error calculating test results:', error);
      return null;
    }
  }

  private async getTest(testId: string): Promise<ABTest | null> {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) throw error;
      return data as ABTest;
    } catch (error) {
      return null;
    }
  }

  private async getTestVariants(testId: string): Promise<ABTestVariant[]> {
    try {
      const { data, error } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('test_id', testId);

      if (error) throw error;
      return (data || []) as ABTestVariant[];
    } catch (error) {
      return [];
    }
  }

  private async analyzeVariant(testId: string, variantId: string, metricName: string): Promise<ABTestResults | null> {
    try {
      // Get assignments for this variant
      const { data: assignments } = await supabase
        .from('ab_test_assignments')
        .select('id')
        .eq('test_id', testId)
        .eq('variant_id', variantId);

      if (!assignments) return null;

      const assignmentIds = assignments.map(a => a.id);
      const sample_size = assignmentIds.length;

      // Get conversion events
      const { data: events } = await supabase
        .from('ab_test_events')
        .select('*')
        .eq('test_id', testId)
        .eq('variant_id', variantId)
        .eq('event_type', metricName)
        .in('assignment_id', assignmentIds);

      const conversion_count = events?.length || 0;
      const conversion_rate = sample_size > 0 ? conversion_count / sample_size : 0;

      // Calculate confidence interval
      const confidence_interval = this.calculateConfidenceInterval(conversion_rate, sample_size);

      // Save results to database
      const { data: result, error } = await supabase
        .from('ab_test_results')
        .upsert({
          test_id: testId,
          variant_id: variantId,
          metric_name: metricName,
          sample_size,
          conversion_count,
          conversion_rate,
          confidence_interval,
          calculated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return result as ABTestResults;
    } catch (error) {
      console.error('Error analyzing variant:', error);
      return null;
    }
  }

  private calculateLift(controlRate: number, variantRate: number): number {
    if (controlRate === 0) return 0;
    return (variantRate - controlRate) / controlRate;
  }

  private calculateConfidenceInterval(rate: number, sampleSize: number, confidence: number = 0.95): { lower: number; upper: number } {
    if (sampleSize === 0) return { lower: 0, upper: 0 };

    const z = confidence === 0.95 ? 1.96 : 2.58; // 95% or 99% confidence
    const standardError = Math.sqrt((rate * (1 - rate)) / sampleSize);
    const margin = z * standardError;

    return {
      lower: Math.max(0, rate - margin),
      upper: Math.min(1, rate + margin)
    };
  }

  private async calculateStatisticalSignificance(
    controlSize: number,
    controlRate: number,
    variantSize: number,
    variantRate: number
  ): Promise<{ p_value: number; significant: boolean }> {
    // Two-proportion z-test
    const pooledRate = (controlSize * controlRate + variantSize * variantRate) / (controlSize + variantSize);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlSize + 1/variantSize));
    
    if (standardError === 0) return { p_value: 1, significant: false };
    
    const z = (variantRate - controlRate) / standardError;
    const p_value = 2 * (1 - this.normalCDF(Math.abs(z)));
    
    return {
      p_value,
      significant: p_value < 0.05
    };
  }

  private normalCDF(x: number): number {
    // Approximation of the cumulative distribution function for standard normal distribution
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of the error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private determineWinner(variantAnalyses: VariantAnalysis[]): VariantAnalysis | null {
    // Find the variant with the highest conversion rate that is statistically significant
    const significantVariants = variantAnalyses.filter(v => 
      (v.performance.significance || 1) < 0.05
    );

    if (significantVariants.length === 0) return null;

    return significantVariants.reduce((prev, current) => 
      current.performance.conversion_rate > prev.performance.conversion_rate ? current : prev
    );
  }

  private generateRecommendation(variantAnalyses: VariantAnalysis[], test: ABTest): string {
    const winner = this.determineWinner(variantAnalyses);
    
    if (!winner) {
      const hasMinimumSample = variantAnalyses.every(v => 
        v.performance.sample_size >= test.minimum_sample_size
      );
      
      if (!hasMinimumSample) {
        return 'Continue running the test until minimum sample size is reached for all variants.';
      } else {
        return 'No statistically significant winner found. Consider running the test longer or analyzing different metrics.';
      }
    }

    const lift = winner.performance.lift ? (winner.performance.lift * 100).toFixed(1) : '0';
    return `${winner.variant.name} is the winner with a ${lift}% improvement over the control. Implement this variant.`;
  }

  // Get historical results
  async getTestResults(testId: string): Promise<ABTestResults[]> {
    try {
      const { data, error } = await supabase
        .from('ab_test_results')
        .select('*')
        .eq('test_id', testId)
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ABTestResults[];
    } catch (error) {
      console.error('Error fetching test results:', error);
      return [];
    }
  }

  // Real-time analytics
  async getTestPerformanceMetrics(testId: string): Promise<{
    totalParticipants: number;
    totalEvents: number;
    variantDistribution: Record<string, number>;
    conversionRates: Record<string, number>;
  }> {
    try {
      // Get total participants
      const { count: totalParticipants } = await supabase
        .from('ab_test_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('test_id', testId);

      // Get total events
      const { count: totalEvents } = await supabase
        .from('ab_test_events')
        .select('*', { count: 'exact', head: true })
        .eq('test_id', testId);

      // Get variant distribution
      const { data: assignments } = await supabase
        .from('ab_test_assignments')
        .select('variant_id')
        .eq('test_id', testId);

      const variantDistribution: Record<string, number> = {};
      assignments?.forEach(assignment => {
        variantDistribution[assignment.variant_id] = 
          (variantDistribution[assignment.variant_id] || 0) + 1;
      });

      // Get conversion rates by variant
      const conversionRates: Record<string, number> = {};
      const variants = await this.getTestVariants(testId);
      
      for (const variant of variants) {
        const { count: conversions } = await supabase
          .from('ab_test_events')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', testId)
          .eq('variant_id', variant.id)
          .eq('event_type', 'conversion');

        const participants = variantDistribution[variant.id] || 0;
        conversionRates[variant.id] = participants > 0 ? (conversions || 0) / participants : 0;
      }

      return {
        totalParticipants: totalParticipants || 0,
        totalEvents: totalEvents || 0,
        variantDistribution,
        conversionRates
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return {
        totalParticipants: 0,
        totalEvents: 0,
        variantDistribution: {},
        conversionRates: {}
      };
    }
  }
}

export const abTestAnalyticsService = ABTestAnalyticsService.getInstance();