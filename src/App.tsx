
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";

import Landing from "./pages/Landing";
import ContentFeaturePage from "./pages/features/ContentPage";
import MarketingFeaturePage from "./pages/features/MarketingPage";
import AudienceFeaturePage from "./pages/features/AudiencePage";
import AnalyticsFeaturePage from "./pages/features/AnalyticsPage";
import Auth from "./pages/Auth";
import CheckEmail from "./pages/CheckEmail";
import AuthCallback from "./pages/AuthCallback";
import Repository from "./pages/Repository";
import AIProposals from "./pages/AIProposals";
import ContentApproval from "./pages/ContentApproval";
import Solutions from "./pages/Solutions";
import KeywordsPage from "./pages/keywords/KeywordsPage";
import { migrateKeywordsToArray } from "@/utils/migration/keywordArrayMigration";

import Analytics from "./pages/Analytics";
import CalendarPage from "./pages/research/Calendar";
import Campaigns from "./pages/Campaigns";
import Engage from "./pages/Engage";

import AIChat from "./pages/AIChat";
import AISettings from "./pages/AISettings";
import WixCallback from "./pages/WixCallback";
import SharedConversation from "./pages/SharedConversation";
import NotFound from "./pages/NotFound";
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
        return;
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
const AppErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={resetErrorBoundary}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary FallbackComponent={AppErrorFallback} onReset={() => window.location.reload()}>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TourProvider>
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
                  <Route path="/shared-conversation/:conversationId" element={<SharedConversation />} />

                  {/* All other protected routes wrapped in AppLayout for persistent sidebar */}
                  <Route path="/drafts" element={<ProtectedRoute><AppLayout><Repository /></AppLayout></ProtectedRoute>} />
                  <Route path="/repository" element={<ProtectedRoute><AppLayout><Repository /></AppLayout></ProtectedRoute>} />
                  <Route path="/content-approval" element={<ProtectedRoute><AppLayout><ContentApproval /></AppLayout></ProtectedRoute>} />
                  <Route path="/ai-proposals" element={<ProtectedRoute><AppLayout><AIProposals /></AppLayout></ProtectedRoute>} />
                  <Route path="/glossary-builder" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/offerings" element={<ProtectedRoute><AppLayout><Solutions /></AppLayout></ProtectedRoute>} />
                  <Route path="/keywords" element={<ProtectedRoute><AppLayout><KeywordsPage /></AppLayout></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
                  <Route path="/ai-settings" element={<ProtectedRoute><AppLayout><AISettings /></AppLayout></ProtectedRoute>} />
                  
                  {/* Calendar (moved from /research/calendar) */}
                  <Route path="/calendar" element={<ProtectedRoute><AppLayout><CalendarPage /></AppLayout></ProtectedRoute>} />
                  
                  {/* Campaigns */}
                  <Route path="/campaigns" element={<ProtectedRoute><AppLayout><Campaigns /></AppLayout></ProtectedRoute>} />
                  
                  {/* Engage */}
                  <Route path="/engage/*" element={<ProtectedRoute><AppLayout><Engage /></AppLayout></ProtectedRoute>} />
                  
                  {/* Redirects for removed pages */}
                  <Route path="/ai-streaming-chat" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/content-type-selection" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/repository/backfill" element={<Navigate to="/repository" replace />} />
                  <Route path="/notifications/demo" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/enterprise" element={<Navigate to="/ai-settings" replace />} />
                  <Route path="/smart-actions/analytics" element={<Navigate to="/analytics" replace />} />
                  <Route path="/workflows/history" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/research/content-strategy" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/research/serp-intelligence" element={<Navigate to="/keywords" replace />} />
                  <Route path="/research/topic-clusters" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/research/content-gaps" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/research/calendar" element={<Navigate to="/calendar" replace />} />
                  <Route path="/research/pipeline" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/content-calendar" element={<Navigate to="/calendar" replace />} />
                  <Route path="/approvals" element={<Navigate to="/content-approval" replace />} />
                  <Route path="/content" element={<Navigate to="/repository" replace />} />
                  <Route path="/content-repurposing" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/content-strategy" element={<Navigate to="/ai-proposals" replace />} />
                  <Route path="/seo-tools" element={<Navigate to="/keywords" replace />} />
                  <Route path="/team" element={<Navigate to="/ai-chat" replace />} />
                  <Route path="/templates" element={<Navigate to="/engage/email" replace />} />
                  <Route path="/research" element={<Navigate to="/ai-chat" replace />} />

                  {/* Redirects for legacy routes */}
                  <Route path="/settings" element={<Navigate to="/ai-settings" replace />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </SidebarProvider>
              </BrowserRouter>
              </ChatContextBridgeProvider>
        </ContentProvider>
        </SettingsProvider>
        </TourProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);


export default App;
