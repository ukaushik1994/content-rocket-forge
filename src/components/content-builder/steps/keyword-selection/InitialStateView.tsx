
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordSearch } from '@/components/content-builder/keyword/KeywordSearch';
import { LightbulbIcon } from 'lucide-react';

interface InitialStateViewProps {
  onSearch: (keyword: string, suggestions: string[]) => void;
}

export const InitialStateView: React.FC<InitialStateViewProps> = ({ onSearch }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyword Research</CardTitle>
          <CardDescription>
            Start by searching for your main keyword to research related terms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <KeywordSearch
            onSearch={onSearch}
            placeholder="Enter your main keyword (e.g. content marketing)"
            buttonText="Research"
          />
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            <div className="flex gap-3">
              <LightbulbIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Keyword Research Tips</h3>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Start with a broad keyword related to your topic</li>
                  <li>Select both short and long-tail keywords</li>
                  <li>Include question-based keywords for better content</li>
                  <li>Choose 3-5 related keywords for your content</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
