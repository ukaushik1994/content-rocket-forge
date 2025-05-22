
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Edit, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RecentDraftsCarouselProps {
  drafts: ContentItemType[];
}

export const RecentDraftsCarousel: React.FC<RecentDraftsCarouselProps> = ({ drafts }) => {
  const navigate = useNavigate();
  
  if (drafts.length === 0) {
    return null;
  }
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };
  
  const handleEdit = (id: string) => {
    navigate(`/content-builder`, { state: { contentId: id } });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Recent Drafts</h2>
        <Button 
          variant="link" 
          className="text-neon-purple flex items-center gap-1" 
          onClick={() => navigate('/content-builder')}
        >
          Create new
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {drafts.map((draft) => (
              <CarouselItem key={draft.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full bg-card/30 backdrop-blur-sm border-white/10 hover:border-white/20 hover:shadow-lg transition-all overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-blue" />
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="bg-white/5">
                          Draft
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(draft.updated_at)}
                        </span>
                      </div>
                      <CardTitle className="mt-2 text-lg line-clamp-1">{draft.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pb-0">
                      <div className="line-clamp-2 text-sm opacity-80">
                        {draft.content ? (
                          <div dangerouslySetInnerHTML={{ 
                            __html: draft.content?.substring(0, 120) + '...'
                          }} />
                        ) : (
                          <span className="text-muted-foreground italic">No content</span>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-4 flex justify-end gap-2 mt-auto">
                      <Button size="sm" variant="ghost" className="gap-1">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="default"
                        className="gap-1 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white"
                        onClick={() => handleEdit(draft.id)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1" />
          <CarouselNext className="right-1" />
        </Carousel>
      </div>
    </div>
  );
};
