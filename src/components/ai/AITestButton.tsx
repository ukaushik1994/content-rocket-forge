import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';

interface AITestButtonProps {
  provider: string;
  onTestComplete?: (success: boolean) => void;
  className?: string;
}

export function AITestButton({ provider, onTestComplete, className }: AITestButtonProps) {
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (isTesting) return;

    try {
      setIsTesting(true);
      
      console.log(`🧪 Testing ${provider} connection...`);
      const success = await AIServiceController.testProvider(provider);
      
      if (success) {
        toast.success(`${provider} connection successful!`);
      }
      
      onTestComplete?.(success);
    } catch (error: any) {
      console.error(`Error testing ${provider}:`, error);
      toast.error(`Failed to test ${provider}: ${error.message}`);
      onTestComplete?.(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button
      onClick={handleTest}
      disabled={isTesting}
      variant="outline"
      size="sm"
      className={className}
    >
      {isTesting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Testing...
        </>
      ) : (
        <>
          <TestTube className="w-4 h-4 mr-2" />
          Test Connection
        </>
      )}
    </Button>
  );
}