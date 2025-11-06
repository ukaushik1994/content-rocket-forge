import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface SocialProofCardProps {
  data?: CompetitorAutoFillPayload;
  onExtract?: () => void;
  isExtracting?: boolean;
}

export function SocialProofCard({ data, onExtract, isExtracting }: SocialProofCardProps) {
  const fields = [
    { key: 'notable_customers', label: 'Notable Customers', value: data?.notable_customers?.length },
    { key: 'case_study_count', label: 'Case Studies', value: data?.case_study_count },
    { key: 'testimonial_highlights', label: 'Testimonials', value: data?.testimonial_highlights?.length },
    { key: 'awards_certifications', label: 'Awards', value: data?.awards_certifications?.length },
    { key: 'partnerships', label: 'Partnerships', value: data?.partnerships?.length },
  ];

  const extractedCount = fields.filter(f => f.value).length;
  const completeness = Math.round((extractedCount / fields.length) * 100);
  const hasData = data?.notable_customers?.length || data?.case_study_count || 
                  data?.testimonial_highlights?.length || data?.awards_certifications?.length || 
                  data?.partnerships?.length;

  if (!data) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Social Proof</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              No Data
            </Badge>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Extract customer proof, testimonials, and certifications
            </p>
            {onExtract && (
              <Button onClick={onExtract} disabled={isExtracting} size="sm" variant="outline">
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extract Data
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!hasData) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Social Proof</h3>
          </div>
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            0% Complete
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No social proof data extracted. Try running extraction again.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Social Proof</h3>
        </div>
        <Badge variant={completeness >= 75 ? "default" : completeness >= 50 ? "secondary" : "outline"} className="gap-1">
          {completeness >= 75 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {completeness}% Complete
        </Badge>
      </div>
      <div className="space-y-4">
        {data.notable_customers && data.notable_customers.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Notable Customers</p>
            <div className="flex flex-wrap gap-2">
              {data.notable_customers.map((customer, idx) => (
                <Badge key={idx} variant="secondary">{customer}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.case_study_count && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Case Studies</p>
            <Badge variant="outline">{data.case_study_count} case studies published</Badge>
          </div>
        )}

        {data.testimonial_highlights && data.testimonial_highlights.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Testimonial Highlights</p>
            <ul className="space-y-2">
              {data.testimonial_highlights.map((testimonial, idx) => (
                <li key={idx} className="text-sm italic border-l-2 border-primary/20 pl-3">
                  "{testimonial}"
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.awards_certifications && data.awards_certifications.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Awards & Certifications</p>
            <div className="flex flex-wrap gap-2">
              {data.awards_certifications.map((award, idx) => (
                <Badge key={idx} variant="default">{award}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.partnerships && data.partnerships.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Key Partnerships</p>
            <div className="flex flex-wrap gap-2">
              {data.partnerships.map((partner, idx) => (
                <Badge key={idx} variant="outline">{partner}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
