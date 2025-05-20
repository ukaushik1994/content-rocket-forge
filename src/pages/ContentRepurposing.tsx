
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { ContentSelection } from '@/components/content-repurposing/ContentSelection';
import { ContentFormatSelection } from '@/components/content-repurposing/ContentFormatSelection';
import { GeneratedContentDisplay } from '@/components/content-repurposing/GeneratedContentDisplay';
import { RepurposedContentDialog } from '@/components/content-repurposing/RepurposedContentDialog';
import { Helmet } from 'react-helmet-async';
import { ContentSelectionView, ContentRepurposingView } from './content-repurposing';

/**
 * Content Repurposing Page
 * This page is now deprecated and redirects to the new implementation.
 * We keep this for backward compatibility.
 */
const ContentRepurposing = () => {
  const [viewState, setViewState] = React.useState<'selection' | 'repurposing'>('selection');
  const [selectedContentId, setSelectedContentId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogContentId, setDialogContentId] = React.useState<string | null>(null);
  
  // Load user preferences from local storage
  React.useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem('repurposing_preferences');
      if (storedPrefs) {
        const prefs = JSON.parse(storedPrefs);
        
        // If we have a previously selected content, restore it
        if (prefs.selectedContentId) {
          setSelectedContentId(prefs.selectedContentId);
          setViewState('repurposing');
        }
      }
    } catch (error) {
      console.error('Failed to load repurposing preferences:', error);
    }
  }, []);
  
  // Save user preferences to local storage
  const savePreferences = (contentId: string) => {
    try {
      const prefsToSave = {
        selectedContentId: contentId,
        lastUsed: new Date().toISOString()
      };
      
      localStorage.setItem('repurposing_preferences', JSON.stringify(prefsToSave));
    } catch (error) {
      console.error('Failed to save repurposing preferences:', error);
    }
  };
  
  // Handle content selection
  const handleContentSelect = (contentId: string) => {
    setSelectedContentId(contentId);
    savePreferences(contentId);
    setViewState('repurposing');
  };
  
  // Handle going back to content selection
  const handleBackToSelection = () => {
    setViewState('selection');
  };
  
  // Handle opening content dialog
  const handleOpenDialog = (contentId: string) => {
    setDialogContentId(contentId);
    setDialogOpen(true);
  };

  // Get repurposed content from local storage
  const getRepurposedContent = (contentId: string) => {
    try {
      const storedData = localStorage.getItem(`repurposed_content_${contentId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return {
          repurposedContentMap: parsedData.repurposedContentMap || {},
          repurposedFormats: parsedData.repurposedFormats || []
        };
      }
    } catch (error) {
      console.error('Failed to load repurposed content:', error);
    }
    
    return {
      repurposedContentMap: {},
      repurposedFormats: []
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Content Repurposing | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        {viewState === 'selection' ? (
          <ContentSelectionView onContentSelect={handleContentSelect} />
        ) : (
          <ContentRepurposingView 
            contentId={selectedContentId || ''} 
            onBackToSelection={handleBackToSelection}
          />
        )}
      </main>
      
      {dialogOpen && dialogContentId && (
        <RepurposedContentDialog
          contentId={dialogContentId}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default ContentRepurposing;
