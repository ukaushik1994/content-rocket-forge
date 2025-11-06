import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Users, FileText, Handshake } from 'lucide-react';
import { CompetitorAutoFillPayload } from '@/types/competitor-intel';

interface SocialProofCardProps {
  data: CompetitorAutoFillPayload;
}

export function SocialProofCard({ data }: SocialProofCardProps) {
  const hasData = data.notable_customers?.length || data.case_study_count || 
                  data.testimonial_highlights?.length || data.awards_certifications?.length || 
                  data.partnerships?.length;

  if (!hasData) {
    return (
      <GlassCard className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Award className="h-8 w-8 text-primary/50" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">No Social Proof Data</h3>
            <p className="text-sm text-muted-foreground">
              Customer testimonials and credentials will appear here
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-primary" />
        Social Proof & Credibility
      </h3>
      <div className="space-y-4">
        {data.notable_customers && data.notable_customers.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Notable Customers
            </p>
            <div className="flex flex-wrap gap-2">
              {data.notable_customers.map((customer, idx) => (
                <Badge key={idx} variant="secondary">{customer}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.case_study_count && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Case Studies
            </p>
            <Badge variant="outline" className="text-base font-semibold">
              {data.case_study_count}
            </Badge>
          </div>
        )}

        {data.testimonial_highlights && data.testimonial_highlights.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Star className="w-3 h-3" />
              Testimonial Highlights
            </p>
            <div className="space-y-2">
              {data.testimonial_highlights.slice(0, 2).map((testimonial, idx) => (
                <GlassCard key={idx} className="p-3 bg-card/40 border-l-2 border-primary/50">
                  <p className="text-sm italic text-muted-foreground">"{testimonial}"</p>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {data.awards_certifications && data.awards_certifications.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Awards & Certifications
            </p>
            <div className="flex flex-wrap gap-2">
              {data.awards_certifications.map((award, idx) => (
                <Badge key={idx} variant="outline" className="gap-1">
                  <Award className="w-3 h-3" />
                  {award}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.partnerships && data.partnerships.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Handshake className="w-3 h-3" />
              Partnerships
            </p>
            <div className="flex flex-wrap gap-2">
              {data.partnerships.map((partner, idx) => (
                <Badge key={idx} variant="secondary">{partner}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
