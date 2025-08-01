import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Hash, 
  List, 
  ArrowRight, 
  BookOpen,
  CheckCircle,
  MessageCircle
} from 'lucide-react';
import { ComprehensiveSerpInsights } from '@/services/comprehensiveSerpAnalyzer';

interface ContentOutlinePreviewProps {
  insights: ComprehensiveSerpInsights;
  onStartContentBuilder?: () => void;
}

export const ContentOutlinePreview: React.FC<ContentOutlinePreviewProps> = ({
  insights,
  onStartContentBuilder
}) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const outline = insights.contentOutline;

  return (
    <Card className="bg-card/50 backdrop-blur border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI-Generated Content Outline
          </CardTitle>
          <Badge variant="default" className="bg-gradient-to-r from-primary to-blue-500">
            Ready to Build
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Comprehensive outline based on SERP analysis and competitor research
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Suggestions */}
        <motion.div variants={fadeInUp} className="space-y-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <Hash className="h-4 w-4" />
            Suggested Title (H1)
          </h3>
          <div className="p-3 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/20">
            <p className="font-medium">{outline.title}</p>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div variants={fadeInUp} className="space-y-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-4 w-4" />
            Introduction
          </h3>
          <div className="p-3 bg-background/50 rounded-lg border border-white/10">
            <p className="text-sm text-muted-foreground">{outline.introduction}</p>
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <h3 className="flex items-center gap-2 font-semibold">
            <List className="h-4 w-4" />
            Content Sections ({outline.sections.length})
          </h3>
          <div className="space-y-3">
            {outline.sections.map((section, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-white/10"
              >
                <Badge variant="outline" className="text-xs mt-1">
                  {section.level.toUpperCase()}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{section.heading}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{section.content}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {section.keywords.slice(0, 3).map((keyword, kIndex) => (
                      <Badge key={kIndex} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        {outline.faqSection.length > 0 && (
          <motion.div variants={fadeInUp} className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold">
              <MessageCircle className="h-4 w-4" />
              FAQ Section ({outline.faqSection.length} questions)
            </h3>
            <div className="space-y-2">
              {outline.faqSection.slice(0, 4).map((faq, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-white/10"
                >
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{faq.question}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
              {outline.faqSection.length > 4 && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    +{outline.faqSection.length - 4} more questions
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Conclusion */}
        <motion.div variants={fadeInUp} className="space-y-2">
          <h3 className="font-semibold">Conclusion</h3>
          <div className="p-3 bg-background/50 rounded-lg border border-white/10">
            <p className="text-sm text-muted-foreground">{outline.conclusion}</p>
          </div>
        </motion.div>

        {/* Action Button */}
        {onStartContentBuilder && (
          <motion.div variants={fadeInUp} className="pt-4 border-t border-white/10">
            <Button 
              onClick={onStartContentBuilder}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
            >
              Generate Content with This Outline
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};