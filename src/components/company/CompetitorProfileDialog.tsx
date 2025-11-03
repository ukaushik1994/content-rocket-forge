import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyCompetitor } from '@/contexts/content-builder/types/company-types';
import { Building2, Link as LinkIcon, TrendingUp, TrendingDown, Package, Bookmark, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompetitorSolutionsTab } from './CompetitorSolutionsTab';

interface CompetitorProfileDialogProps {
  competitor: CompanyCompetitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (competitor: CompanyCompetitor) => void;
}

export function CompetitorProfileDialog({ competitor, open, onOpenChange, onEdit }: CompetitorProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {competitor.logoUrl ? (
              <img src={competitor.logoUrl} alt={competitor.name} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{competitor.name}</DialogTitle>
                  {competitor.marketPosition && (
                    <p className="text-sm text-muted-foreground mt-1">{competitor.marketPosition}</p>
                  )}
                  {competitor.website && (
                    <a
                      href={competitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {competitor.website}
                    </a>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(competitor);
                    onOpenChange(false);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview" className="space-y-6 m-0 p-6">
              {competitor.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{competitor.description}</p>
                </div>
              )}

              {competitor.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {competitor.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-1">●</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {competitor.weaknesses.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {competitor.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-1">●</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="solutions" className="m-0 p-6">
              <CompetitorSolutionsTab competitor={competitor} />
            </TabsContent>

            <TabsContent value="resources" className="m-0 p-6">
              <div className="space-y-4">
                {competitor.resources.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No resources added yet</p>
                ) : (
                  competitor.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-lg border hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{resource.url}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {resource.category}
                        </Badge>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="m-0 p-6">
              {competitor.notes ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm whitespace-pre-wrap">{competitor.notes}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bookmark className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No notes added yet</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
