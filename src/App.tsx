
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Repository from "./pages/Repository";
import ContentBuilderPage from "./pages/ContentBuilder";
import ContentTypeSelection from "./pages/ContentTypeSelection";
import ContentApproval from "./pages/ContentApproval";
import GlossaryBuilder from "./pages/GlossaryBuilder";
import Solutions from "./pages/Solutions";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import ContentStrategy from "./pages/research/ContentStrategy";
import ResearchHub from "./pages/research/ResearchHub";
import TopicClusters from "./pages/research/TopicClusters";
import OpportunitiesPage from "./pages/research/Opportunities";
import ContentGapsPage from "./pages/research/ContentGaps";
import CalendarPage from "./pages/research/Calendar";
// Pipeline route removed - integrated into Content Strategy


import AIChat from "./pages/AIChat";
import AISettings from "./pages/AISettings";
import NotificationDemo from "./pages/NotificationDemo";
import NotFound from "./pages/NotFound";
import SmartActionsAnalytics from "./pages/SmartActionsAnalytics";
import { ContentProvider } from "@/contexts/content";
import { AuthProvider } from "./contexts/AuthContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { TourProvider } from "@/contexts/TourContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ContentProvider>
          <FeedbackProvider>
            <TourProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  
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
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  
                  {/* AI Chat routes */}
                  <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
                  <Route path="/ai-settings" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
                  
                  {/* Research routes */}
                  <Route path="/research/content-strategy" element={<ProtectedRoute><ContentStrategy /></ProtectedRoute>} />
                   <Route path="/research/research-hub" element={<ProtectedRoute><ResearchHub /></ProtectedRoute>} />
                   <Route path="/research/keyword-research" element={<Navigate to="/research/research-hub#keyword-intelligence" replace />} />
                   <Route path="/research/answer-the-people" element={<Navigate to="/research/research-hub#people-questions" replace />} />
                  <Route path="/research/topic-clusters" element={<ProtectedRoute><TopicClusters /></ProtectedRoute>} />
                  <Route path="/research/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
                  <Route path="/research/opportunity-hunter" element={<Navigate to="/research/opportunities" replace />} />
                  
                   <Route path="/research/content-gaps" element={<ProtectedRoute><ContentGapsPage /></ProtectedRoute>} />
                   <Route path="/research/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                   <Route path="/research/pipeline" element={<Navigate to="/research/content-strategy#pipeline" replace />} />
                  

                   {/* Smart Actions Analytics */}
                   <Route path="/smart-actions/analytics" element={<ProtectedRoute><SmartActionsAnalytics /></ProtectedRoute>} />
                   
                   {/* Notification Demo */}
                   <Route path="/notifications/demo" element={<ProtectedRoute><NotificationDemo /></ProtectedRoute>} />
                   
                   {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TourProvider>
          </FeedbackProvider>
        </ContentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
