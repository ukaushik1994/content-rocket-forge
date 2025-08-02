import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export function ContentTypeStep() {
  const { state, dispatch } = useContentBuilder();

  const handleContentTypeChange = (type: string) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: type });
  };

  const handleContentFormatChange = (format: string) => {
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: format });
  };

  const handleContentIntentChange = (intent: string) => {
    dispatch({ type: 'SET_CONTENT_INTENT', payload: intent });
  };

  return (
    <div className="space-y-4">
      {/* Content Type */}
      <div>
        <h4 className="text-sm font-medium leading-none mb-2">Content Type</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`border rounded-md p-2 text-sm ${state.contentType === 'article' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleContentTypeChange('article')}
          >
            Article
          </button>
          <button
            className={`border rounded-md p-2 text-sm ${state.contentType === 'listicle' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleContentTypeChange('listicle')}
          >
            Listicle
          </button>
          <button
            className={`border rounded-md p-2 text-sm ${state.contentType === 'guide' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleContentTypeChange('guide')}
          >
            Guide
          </button>
        </div>
      </div>

      {/* Content Format */}
      <div>
        <h4 className="text-sm font-medium leading-none mb-2">Content Format</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`border rounded-md p-2 text-sm ${state.contentFormat === 'long-form' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleContentFormatChange('long-form')}
          >
            Long-form
          </button>
          <button
            className={`border rounded-md p-2 text-sm ${state.contentFormat === 'short-form' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleContentFormatChange('short-form')}
          >
            Short-form
          </button>
          <button
            className={`border rounded-md p-2 text-sm ${state.contentFormat === 'visual' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleContentFormatChange('visual')}
          >
            Visual
          </button>
        </div>
      </div>

      {/* Content Intent */}
      <div>
        <h4 className="text-sm font-medium leading-none mb-2">Content Intent</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`border rounded-md p-2 text-sm ${state.contentIntent === 'inform' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleContentIntentChange('inform')}
          >
            Inform
          </button>
          <button
            className={`border rounded-md p-2 text-sm ${state.contentIntent === 'persuade' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleContentIntentChange('persuade')}
          >
            Persuade
          </button>
          <button
            className={`border rounded-md p-2 text-sm ${state.contentIntent === 'entertain' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleContentIntentChange('entertain')}
          >
            Entertain
          </button>
        </div>
      </div>
    </div>
  );
}
