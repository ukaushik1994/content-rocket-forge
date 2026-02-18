import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailBuilderPreviewProps {
  html: string;
}

export const EmailBuilderPreview: React.FC<EmailBuilderPreviewProps> = ({ html }) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const width = device === 'desktop' ? 600 : 320;

  const previewHtml = html
    .replace(/\{\{first_name\}\}/g, 'John')
    .replace(/\{\{last_name\}\}/g, 'Doe')
    .replace(/\{\{email\}\}/g, 'john@example.com')
    .replace(/\{\{unsubscribe_link\}\}/g, '#');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-center gap-2 p-3 border-b border-border/40">
        <Button
          variant={device === 'desktop' ? 'default' : 'ghost'}
          size="sm" className="h-7 text-xs gap-1"
          onClick={() => setDevice('desktop')}
        >
          <Monitor className="h-3.5 w-3.5" /> Desktop
        </Button>
        <Button
          variant={device === 'mobile' ? 'default' : 'ghost'}
          size="sm" className="h-7 text-xs gap-1"
          onClick={() => setDevice('mobile')}
        >
          <Smartphone className="h-3.5 w-3.5" /> Mobile
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
        <div
          className="mx-auto bg-white shadow-lg rounded-sm"
          style={{ maxWidth: width, width: '100%' }}
        >
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewHtml) }} />
          ) : (
            <div className="py-24 text-center text-muted-foreground text-sm">No content to preview</div>
          )}
        </div>
      </div>
    </div>
  );
};
