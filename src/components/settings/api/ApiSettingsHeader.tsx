
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';

interface ApiSettingsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onDisplayOptionChange: (value: string) => void;
}

export const ApiSettingsHeader = ({ 
  searchQuery, 
  onSearchChange, 
  onDisplayOptionChange 
}: ApiSettingsHeaderProps) => {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-2">API Integration</h2>
        <p className="text-muted-foreground">
          Connect third-party APIs to enhance content generation and analysis capabilities.
        </p>
      </div>

      <Alert className="bg-blue-900/20 border-blue-500/30">
        <Info className="h-4 w-4" />
        <AlertTitle>Missing API Keys?</AlertTitle>
        <AlertDescription>
          The application will use mock data when API keys are not configured. Add your API keys below for real-time data.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mb-4"
          />
        </div>
        <div>
          <Select
            onValueChange={onDisplayOptionChange}
            defaultValue="required"
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Display options" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Show All</SelectItem>
              <SelectItem value="required">Required Only</SelectItem>
              <SelectItem value="none">Hide Optional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
