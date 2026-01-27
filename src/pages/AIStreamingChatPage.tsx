import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AIStreamingChatPage - Deprecated
 * 
 * This page has been consolidated into the main AIChat page.
 * All streaming functionality is now available in /ai-chat.
 * 
 * This component redirects to the unified chat experience.
 */
export const AIStreamingChatPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the unified AI Chat page
    console.log('📌 AIStreamingChatPage is deprecated. Redirecting to /ai-chat...');
    navigate('/ai-chat', { replace: true });
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to AI Chat...</p>
      </div>
    </div>
  );
};