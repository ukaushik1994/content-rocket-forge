
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import ContentFeaturePage from "./pages/features/ContentPage";
import MarketingFeaturePage from "./pages/features/MarketingPage";
import AudienceFeaturePage from "./pages/features/AudiencePage";
import AnalyticsFeaturePage from "./pages/features/AnalyticsPage";
import Auth from "./pages/Auth";
import CheckEmail from "./pages/CheckEmail";
import AuthCallback from "./pages/AuthCallback";
import Repository from "./pages/Repository";
import { RepositoryBackfill } from "./pages/RepositoryBackfill";
// ContentBuilder deprecated - redirects to /ai-chat
import ContentTypeSelection from "./pages/ContentTypeSelection";
import ContentApproval from "./pages/ContentApproval";
// GlossaryBuilder removed — feature deprecated
import Solutions from "./pages/Solutions";
import KeywordsPage from "./pages/keywords/KeywordsPage";
import { migrateKeywordsToArray } from "@/utils/migration/keywordArrayMigration";

import Analytics from "./pages/Analytics";
import ContentStrategy from "./pages/research/ContentStrategy";

import SerpIntelligence from "./pages/research/SerpIntelligence";
import TopicClusters from "./pages/research/TopicClusters";

import ContentGapsPage from "./pages/research/ContentGaps";
import CalendarPage from "./pages/research/Calendar";
import Campaigns from "./pages/Campaigns";
import Engage from "./pages/Engage";
// Pipeline route removed - integrated into Content Strategy


import AIChat from "./pages/AIChat";
import AISettings from "./pages/AISettings";
import { AIStreamingChatPage } from "./pages/AIStreamingChatPage";
import WixCallback from "./pages/WixCallback";
import SharedConversation from "./pages/SharedConversation";
import { EnterpriseHubPage } from "./pages/EnterpriseHubPage";
import NotificationDemo from "./pages/NotificationDemo";
import NotFound from "./pages/NotFound";
import SmartActionsAnalytics from "./pages/SmartActionsAnalytics";
import WorkflowHistoryPage from "./components/workflow/WorkflowHistoryPage";
import { ContentProvider } from "@/contexts/content";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SettingsPopup } from "@/components/settings/SettingsPopup";
import { useSettings } from "@/contexts/SettingsContext";

import { TourProvider } from "@/contexts/TourContext";
import { ChatContextBridgeProvider } from "@/contexts/ChatContextBridge";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

// Global settings bridge component
const GlobalSettingsBridge = () => {
  const { openSettings } = useSettings();

  useEffect(() => {
    const handleGlobalOpenSettings = (event: CustomEvent) => {
      openSettings(event.detail);
    };

    window.addEventListener('globalOpenSettings', handleGlobalOpenSettings);
    return () => window.removeEventListener('globalOpenSettings', handleGlobalOpenSettings);
  }, [openSettings]);

  return null;
};

// Silent background migration for keywords
const KeywordMigrationRunner = () => {
  useEffect(() => {
    const runMigration = async () => {
      const migrationCompleted = localStorage.getItem('keywords_migration_completed');
      
      if (migrationCompleted === 'true') {
        return; // Already migrated, skip silently
      }

      try {
        console.log('🔄 Running one-time keyword migration...');
        const result = await migrateKeywordsToArray();
        
        if (result.success) {
          localStorage.setItem('keywords_migration_completed', 'true');
          console.log(`✅ Keyword migration completed: ${result.migratedCount} items migrated`);
        } else {
          console.error('❌ Keyword migration had errors:', result.errors);
        }
      } catch (error) {
        console.error('❌ Keyword migration failed:', error);
      }
    };

    runMigration();
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SettingsProvider>
          <GlobalSettingsBridge />
          <KeywordMigrationRunner />
          <ContentProvider>
              <ChatContextBridgeProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SidebarProvider>
                <SettingsPopup />
                <Routes>
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/check-email" element={<CheckEmail />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/auth/confirm" element={<AuthCallback />} />
                  <Route path="/wix-callback" element={<WixCallback />} />
                  
                  {/* Landing is now the main entry point */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/features/content" element={<ContentFeaturePage />} />
                  <Route path="/features/marketing" element={<MarketingFeaturePage />} />
                  <Route path="/features/audience" element={<AudienceFeaturePage />} />
                  <Route path="/features/analytics" element={<AnalyticsFeaturePage />} />
                  <Route path="/dashboard" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/content-builder" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/solutions" element={<Navigate to="/offerings" replace />} />

                  {/* AI Chat - uses AppLayout for persistent sidebar */}
                  <Route path="/ai-chat" element={<ProtectedRoute><AppLayout><AIChat /></AppLayout></ProtectedRoute>} />
                  <Route path="/ai-streaming-chat" element={<ProtectedRoute><AIStreamingChatPage /></ProtectedRoute>} />
                  <Route path="/shared-conversation/:conversationId" element={<SharedConversation />} />

                  {/* All other protected routes wrapped in AppLayout for persistent sidebar */}
                  <Route path="/drafts" element={<ProtectedRoute><AppLayout><Repository /></AppLayout></ProtectedRoute>} />
                  <Route path="/repository" element={<ProtectedRoute><AppLayout><Repository /></AppLayout></ProtectedRoute>} />
                  <Route path="/repository/backfill" element={<ProtectedRoute><AppLayout><RepositoryBackfill /></AppLayout></ProtectedRoute>} />
                  <Route path="/content-type-selection" element={<ProtectedRoute><AppLayout><ContentTypeSelection /></AppLayout></ProtectedRoute>} />
                  <Route path="/content-approval" element={<ProtectedRoute><AppLayout><ContentApproval /></AppLayout></ProtectedRoute>} />
                  <Route path="/glossary-builder" element={<ProtectedRoute><AppLayout><GlossaryBuilder /></AppLayout></ProtectedRoute>} />
                  <Route path="/offerings" element={<ProtectedRoute><AppLayout><Solutions /></AppLayout></ProtectedRoute>} />
                  <Route path="/keywords" element={<ProtectedRoute><AppLayout><KeywordsPage /></AppLayout></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
                  <Route path="/ai-settings" element={<ProtectedRoute><AppLayout><AISettings /></AppLayout></ProtectedRoute>} />
                  <Route path="/enterprise" element={<ProtectedRoute><AppLayout><EnterpriseHubPage /></AppLayout></ProtectedRoute>} />
                  
                  {/* Research routes */}
                  <Route path="/research/content-strategy" element={<ProtectedRoute><AppLayout><ContentStrategy /></AppLayout></ProtectedRoute>} />
                  <Route path="/research/serp-intelligence" element={<ProtectedRoute><AppLayout><SerpIntelligence /></AppLayout></ProtectedRoute>} />
                  <Route path="/research/topic-clusters" element={<ProtectedRoute><AppLayout><TopicClusters /></AppLayout></ProtectedRoute>} />
                  <Route path="/research/content-gaps" element={<ProtectedRoute><AppLayout><ContentGapsPage /></AppLayout></ProtectedRoute>} />
                  <Route path="/research/calendar" element={<ProtectedRoute><AppLayout><CalendarPage /></AppLayout></ProtectedRoute>} />
                  <Route path="/research/pipeline" element={<Navigate to="/research/content-strategy#pipeline" replace />} />
                  
                  {/* Campaigns */}
                  <Route path="/campaigns" element={<ProtectedRoute><AppLayout><Campaigns /></AppLayout></ProtectedRoute>} />
                  
                  {/* Engage */}
                  <Route path="/engage/*" element={<ProtectedRoute><AppLayout><Engage /></AppLayout></ProtectedRoute>} />
                  
                  {/* Smart Actions Analytics */}
                  <Route path="/smart-actions/analytics" element={<ProtectedRoute><AppLayout><SmartActionsAnalytics /></AppLayout></ProtectedRoute>} />
                  
                  {/* Workflow History */}
                  <Route path="/workflows/history" element={<ProtectedRoute><AppLayout><WorkflowHistoryPage /></AppLayout></ProtectedRoute>} />
                  
                  {/* Notification Demo */}
                  <Route path="/notifications/demo" element={<ProtectedRoute><AppLayout><NotificationDemo /></AppLayout></ProtectedRoute>} />
                  
                  {/* Redirects for legacy routes */}
                  <Route path="/settings" element={<Navigate to="/ai-settings" replace />} />
                  <Route path="/research" element={<Navigate to="/research/content-strategy" replace />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </SidebarProvider>
              </BrowserRouter>
              </ChatContextBridgeProvider>
        </ContentProvider>
        </SettingsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Add global event listener for settings from service layers
if (typeof window !== 'undefined') {
  window.addEventListener('openSettings', (event: CustomEvent) => {
    const tab = event.detail || 'api';
    // This will be handled by the GlobalSettingsBridge component
    window.dispatchEvent(new CustomEvent('globalOpenSettings', { detail: tab }));
  });
}

export default App;
