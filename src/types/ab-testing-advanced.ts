export interface MultivariateTest extends Omit<ABTest, 'type'> {
  type: 'multivariate';
  factors: TestFactor[];
  combinations: VariantCombination[];
}

export interface TestFactor {
  id: string;
  name: string;
  type: 'content' | 'style' | 'layout' | 'functionality';
  values: FactorValue[];
}

export interface FactorValue {
  id: string;
  name: string;
  value: any;
  description?: string;
}

export interface VariantCombination {
  id: string;
  name: string;
  factors: Record<string, string>; // factor_id -> value_id
  traffic_weight: number;
  performance_metrics?: PerformanceMetrics;
}

export interface PerformanceMetrics {
  conversion_rate: number;
  confidence_level: number;
  sample_size: number;
  statistical_significance: boolean;
  uplift_percentage: number;
  revenue_impact?: number;
}

export interface AudienceSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria[];
  size_estimate?: number;
  created_at: string;
}

export interface SegmentCriteria {
  type: 'device' | 'location' | 'behavior' | 'demographic' | 'custom';
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface TargetedTest extends ABTest {
  audience_segments: string[]; // segment IDs
  segment_performance: Record<string, PerformanceMetrics>;
}

export interface TestSchedule {
  id: string;
  test_id: string;
  start_date: string;
  end_date?: string;
  auto_conclude: boolean;
  conclusion_criteria: ConclusionCriteria;
}

export interface ConclusionCriteria {
  min_sample_size: number;
  min_confidence_level: number;
  max_duration_days: number;
  significance_threshold: number;
}

export interface MLOptimization {
  test_id: string;
  prediction_accuracy: number;
  recommended_allocation: Record<string, number>; // variant_id -> traffic_percentage
  predicted_outcomes: Record<string, number>; // variant_id -> predicted_conversion_rate
  anomalies_detected: AnomalyAlert[];
  next_optimization_date: string;
}

export interface AnomalyAlert {
  id: string;
  type: 'performance_drop' | 'unusual_traffic' | 'statistical_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  detected_at: string;
  resolved: boolean;
}

export interface TestApproval {
  id: string;
  test_id: string;
  requester_id: string;
  approver_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  comments?: string;
  approval_workflow: string;
}

export interface TestTemplate {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'ui' | 'seo' | 'conversion' | 'engagement';
  template_config: {
    test_type: string;
    default_variants: ABTestVariant[];
    recommended_metrics: string[];
    sample_size_guidance: string;
    duration_guidance: string;
  };
  usage_count: number;
  created_by: string;
  created_at: string;
}

export interface CohortAnalysis {
  test_id: string;
  cohort_period: 'daily' | 'weekly' | 'monthly';
  cohorts: CohortData[];
  retention_metrics: RetentionMetrics;
}

export interface CohortData {
  cohort_date: string;
  variant_id: string;
  user_count: number;
  conversion_rates: number[];
  retention_rates: number[];
  revenue_data: number[];
}

export interface RetentionMetrics {
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  ltv_impact: number;
}

export interface AdvancedAnalytics {
  test_id: string;
  statistical_power: number;
  effect_size: number;
  confidence_intervals: Record<string, [number, number]>;
  bayesian_probability: Record<string, number>;
  funnel_analysis: FunnelStep[];
  user_journey_impact: JourneyImpact[];
}

export interface FunnelStep {
  step_name: string;
  variant_performance: Record<string, {
    users: number;
    conversion_rate: number;
    drop_off_rate: number;
  }>;
}

export interface JourneyImpact {
  journey_stage: string;
  variant_id: string;
  impact_score: number;
  behavioral_changes: string[];
}