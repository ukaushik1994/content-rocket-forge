
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, FileText } from 'lucide-react';
import { contentFormats, getFormatByIdOrDefault } from '@/components/content-repurposing/formats';

interface GeneratedContentViewProps {
  generatedContents: Record<string, string>;
  activeFormat: string | null;
  title: string;
  onCopy: (content: string) => void;
  onDownload: (content: string, formatName: string) => void;
}

export const GeneratedContentView: React.FC<GeneratedContentViewProps> = ({
  generatedContents,
  activeFormat,
  title,
  onCopy,
  onDownload,
}) => {
  if (!activeFormat || !generatedContents[activeFormat]) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Select a format to view generated content</p>
      </div>
    );
  }

  const formatInfo = getFormatByIdOrDefault(activeFormat);
  const content = generatedContents[activeFormat];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {formatInfo.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          readOnly
          className="min-h-[200px] font-mono text-sm"
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => onCopy(content)}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(content, formatInfo.name)}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GeneratedContentView;
