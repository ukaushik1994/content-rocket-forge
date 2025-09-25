
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import CheckEmail from "./pages/CheckEmail";
import Repository from "./pages/Repository";
import ContentBuilderPage from "./pages/ContentBuilder";
import ContentTypeSelection from "./pages/ContentTypeSelection";
import ContentApproval from "./pages/ContentApproval";
import GlossaryBuilder from "./pages/GlossaryBuilder";
import Solutions from "./pages/Solutions";

import Analytics from "./pages/Analytics";
import ContentStrategy from "./pages/research/ContentStrategy";
import ResearchHub from "./pages/research/ResearchHub";
import SerpIntelligence from "./pages/research/SerpIntelligence";
import TopicClusters from "./pages/research/TopicClusters";

import ContentGapsPage from "./pages/research/ContentGaps";
import CalendarPage from "./pages/research/Calendar";
// Pipeline route removed - integrated into Content Strategy


import AIChat from "./pages/AIChat";
import AISettings from "./pages/AISettings";
import { AIStreamingChatPage } from "./pages/AIStreamingChatPage";
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
import { PWAManager } from "@/components/pwa/PWAManager";


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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SettingsProvider>
          <GlobalSettingsBridge />
          <ContentProvider>
              <TourProvider>
                <ChatContextBridgeProvider>
              <Toaster />
              <Sonner />
              <SettingsPopup />
              <PWAManager />
              <BrowserRouter>
                <Routes>
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/check-email" element={<CheckEmail />} />
                  
                  {/* Landing is now the main entry point */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/drafts" element={<ProtectedRoute><Repository /></ProtectedRoute>} />
                  <Route path="/repository" element={<ProtectedRoute><Repository /></ProtectedRoute>} />
                  <Route path="/content-builder" element={<ProtectedRoute><ContentBuilderPage /></ProtectedRoute>} />
                  <Route path="/content-type-selection" element={<ProtectedRoute><ContentTypeSelection /></ProtectedRoute>} />
                  <Route path="/content-approval" element={<ProtectedRoute><ContentApproval /></ProtectedRoute>} />
                  <Route path="/glossary-builder" element={<ProtectedRoute><GlossaryBuilder /></ProtectedRoute>} />
                  <Route path="/solutions" element={<ProtectedRoute><Solutions /></ProtectedRoute>} />
                  
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  
                   {/* AI Chat routes */}
                   <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
                   <Route path="/ai-streaming-chat" element={<ProtectedRoute><AIStreamingChatPage /></ProtectedRoute>} />
                   <Route path="/ai-settings" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
                   
                   {/* Enterprise Hub route */}
                   <Route path="/enterprise" element={<ProtectedRoute><EnterpriseHubPage /></ProtectedRoute>} />
                  
                   {/* Research routes */}
                   <Route path="/research/content-strategy" element={<ProtectedRoute><ContentStrategy /></ProtectedRoute>} />
                    <Route path="/research/research-hub" element={<ProtectedRoute><ResearchHub /></ProtectedRoute>} />
                    <Route path="/research/serp-intelligence" element={<ProtectedRoute><SerpIntelligence /></ProtectedRoute>} />
                    <Route path="/research/keyword-research" element={<Navigate to="/research/research-hub#keyword-intelligence" replace />} />
                    <Route path="/research/answer-the-people" element={<Navigate to="/research/research-hub#people-questions" replace />} />
                   <Route path="/research/topic-clusters" element={<ProtectedRoute><TopicClusters /></ProtectedRoute>} />
                  
                   <Route path="/research/content-gaps" element={<ProtectedRoute><ContentGapsPage /></ProtectedRoute>} />
                   <Route path="/research/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                   <Route path="/research/pipeline" element={<Navigate to="/research/content-strategy#pipeline" replace />} />
                  

                   {/* Smart Actions Analytics */}
                   <Route path="/smart-actions/analytics" element={<ProtectedRoute><SmartActionsAnalytics /></ProtectedRoute>} />
                   
                   
                   {/* Workflow History */}
                   <Route path="/workflows/history" element={<ProtectedRoute><WorkflowHistoryPage /></ProtectedRoute>} />
                   
                   {/* Notification Demo */}
                   <Route path="/notifications/demo" element={<ProtectedRoute><NotificationDemo /></ProtectedRoute>} />
                   
                   {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
                </ChatContextBridgeProvider>
            </TourProvider>
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
