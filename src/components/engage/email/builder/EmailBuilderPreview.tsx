import React, { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailBuilderPreviewProps {
  html: string;
}

export const EmailBuilderPreview: React.FC<EmailBuilderPreviewProps> = ({ html }) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const width = device === 'desktop' ? 600 : 375;

  const previewHtml = html
    .replace(/\{\{first_name\}\}/g, 'John')
    .replace(/\{\{last_name\}\}/g, 'Doe')
    .replace(/\{\{email\}\}/g, 'john@example.com')
    .replace(/\{\{company_name\}\}/g, 'Acme Inc.')
    .replace(/\{\{company\}\}/g, 'Acme Inc.')
    .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
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
      <div className="flex-1 overflow-y-auto bg-muted/20 p-6 flex justify-center">
        {/* Device Frame */}
        <div className="flex flex-col" style={{ width: device === 'desktop' ? 640 : 395 }}>
          {/* Browser/Phone chrome */}
          {device === 'desktop' ? (
            <div className="bg-muted/60 rounded-t-xl border border-b-0 border-border/40 px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/40" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/40" />
              </div>
              <div className="flex-1 h-5 bg-background/50 rounded-md mx-8" />
            </div>
          ) : (
            <div className="bg-muted/80 rounded-t-[2rem] border border-b-0 border-border/40 pt-3 pb-1 flex justify-center">
              <div className="h-4 w-24 bg-muted-foreground/15 rounded-full" />
            </div>
          )}
          {/* Content */}
          <div className={`bg-background border border-border/40 overflow-hidden ${device === 'desktop' ? 'rounded-b-xl' : 'rounded-b-[2rem]'}`}>
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                title="Email Preview"
                className="w-full border-0"
                style={{ height: 600, width: '100%' }}
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="py-24 text-center text-muted-foreground text-sm">No content to preview</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
