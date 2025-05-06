import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Solution, OutlineSection } from '@/contexts/content-builder/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
interface ContentSidebarProps {
  outline: OutlineSection[];
  selectedSolution: Solution | null;
  additionalInstructions: string;
  handleInstructionsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
export const ContentSidebar: React.FC<ContentSidebarProps> = ({
  outline,
  selectedSolution,
  additionalInstructions,
  handleInstructionsChange
}) => {
  return <div className="flex flex-col gap-4 h-full">
      {/* Outline Card */}
      <Card className="flex-1 flex flex-col border">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-sm font-medium">Content Outline</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Section</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outline.length > 0 ? outline.map((section, index) => <TableRow key={section.id || index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{typeof section === 'string' ? section : section.title}</TableCell>
                    </TableRow>) : <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                      No outline sections yet
                    </TableCell>
                  </TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </ScrollArea>
      </Card>
      
      {/* Solution Info Card */}
      {selectedSolution && <Card className="border">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-sm font-medium">Solution Reference</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium mb-2">{selectedSolution.name}</h3>
              <p className="text-xs text-muted-foreground">{selectedSolution.description}</p>
            </div>
            
            {selectedSolution.features.length > 0 && <div>
                <h4 className="text-xs font-medium mb-1">Features</h4>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  {selectedSolution.features.slice(0, 3).map((feature, index) => <li key={index}>{feature}</li>)}
                </ul>
              </div>}
            
            {selectedSolution.useCases.length > 0 && <div>
                <h4 className="text-xs font-medium mb-1">Use Cases</h4>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  {selectedSolution.useCases.slice(0, 2).map((useCase, index) => <li key={index}>{useCase}</li>)}
                </ul>
              </div>}
          </CardContent>
        </Card>}
      
      {/* Additional Instructions Card */}
      
    </div>;
};