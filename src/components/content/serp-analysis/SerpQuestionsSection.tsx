
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Link, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SerpQuestionsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpQuestionsSection({
  serpData,
  expanded,
  onAddToContent
}: SerpQuestionsSectionProps) {
  if (!expanded) return null;

  const addPeopleAlsoAsk = (question: string, answer?: string) => {
    const content = `### ${question}\n${answer || 'No answer available'}\n\n`;
    onAddToContent(content, 'peopleAlsoAsk');
    toast.success(`Added "${question}" to your content`);
  };

  if (!serpData.peopleAlsoAsk || serpData.peopleAlsoAsk.length === 0) {
    return (
      <div className="py-4 text-center bg-white/5 rounded-lg">
        <p className="text-muted-foreground">No questions data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-purple-900/10 p-4 rounded-xl border border-white/10">
      <Accordion type="single" collapsible className="w-full">
        {serpData.peopleAlsoAsk.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AccordionItem value={`item-${index}`} className="border-white/10">
              <AccordionTrigger className="text-sm hover:no-underline">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <span className="hover:text-primary transition-colors">{item.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-white/5 rounded-lg p-3 mt-2">
                <div className="text-sm space-y-2">
                  <p className="text-muted-foreground">{item.answer || 'No answer available'}</p>
                  {item.source && (
                    <a 
                      href={item.source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 hover:underline text-xs"
                    >
                      <Link className="h-3 w-3" />
                      Source
                    </a>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 bg-white/10 hover:bg-white/20 border border-white/10"
                    onClick={() => addPeopleAlsoAsk(item.question, item.answer)}
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Add to FAQs
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
      
      <Button
        className="w-full mt-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-white/10"
        onClick={() => {
          const allQuestions = serpData.peopleAlsoAsk?.map(item => 
            `### ${item.question}\n${item.answer || 'No answer available'}\n\n`
          ).join('');
          onAddToContent(`## Frequently Asked Questions\n\n${allQuestions}`, 'faqSection');
          toast.success('Added complete FAQ section');
        }}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Complete FAQ Section
      </Button>
    </div>
  );
}
