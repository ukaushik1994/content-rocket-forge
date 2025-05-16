
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { KeywordSearch } from './KeywordSearch';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function KeywordSearchWithApiCheck({ initialKeyword, onKeywordSearch }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = React.useState(false);
  const [hasApiKey, setHasApiKey] = React.useState<boolean | null>(null);
  
  React.useEffect(() => {
    const checkApiKey = async () => {
      setIsChecking(true);
      try {
        const { data } = await supabase
          .from('api_keys')
          .select('encrypted_key')
          .eq('service', 'serp')
          .eq('is_active', true)
          .maybeSingle();
          
        setHasApiKey(!!data?.encrypted_key);
      } catch (error) {
        console.error('Error checking API key:', error);
        setHasApiKey(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkApiKey();
  }, []);
  
  const handleKeywordSearch = async (keyword, suggestions) => {
    if (!hasApiKey) {
      toast.error('SERP API key is required for keyword analysis. Please add it in Settings → API.');
      return;
    }
    
    await onKeywordSearch(keyword, suggestions);
  };
  
  if (hasApiKey === false) {
    return (
      <Card className="bg-amber-950/10 border border-amber-500/30 p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-amber-900/20 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-1">SERP API Key Missing</h4>
            <p className="text-xs text-muted-foreground mb-3">
              You need a SERP API key to analyze keywords and see search data
            </p>
            <Button 
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-900/20"
              onClick={() => navigate('/settings/api')}
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Add API Key
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  return <KeywordSearch initialKeyword={initialKeyword} onKeywordSearch={handleKeywordSearch} />;
}
