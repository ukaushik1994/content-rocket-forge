
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ContentProvider } from "@/contexts/content";
import { AuthProvider } from "./contexts/AuthContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { TourProvider } from "@/contexts/TourContext";
import { FloatingFeedbackButton } from "./components/feedback/FloatingFeedbackButton";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Lazy load all page components
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Repository = React.lazy(() => import("./pages/Repository"));
const ContentBuilderPage = React.lazy(() => import("./pages/ContentBuilder"));
const ContentRepurposing = React.lazy(() => import("./pages/ContentRepurposing"));
const ContentApproval = React.lazy(() => import("./pages/ContentApproval"));
const GlossaryBuilder = React.lazy(() => import("./pages/GlossaryBuilder"));
const Solutions = React.lazy(() => import("./pages/Solutions"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const ContentStrategy = React.lazy(() => import("./pages/research/ContentStrategy"));
const KeywordResearch = React.lazy(() => import("./pages/research/KeywordResearch"));
const AnswerThePeople = React.lazy(() => import("./pages/research/AnswerThePeople"));
const TopicClusters = React.lazy(() => import("./pages/research/TopicClusters"));
const OpportunitiesPage = React.lazy(() => import("./pages/research/Opportunities"));
const ContentGapsPage = React.lazy(() => import("./pages/research/ContentGaps"));
const CalendarPage = React.lazy(() => import("./pages/research/Calendar"));
const PipelinePage = React.lazy(() => import("./pages/research/Pipeline"));
const AioGeo = React.lazy(() => import("./pages/AioGeo"));
const AIChat = React.lazy(() => import("./pages/AIChat"));
const AISettings = React.lazy(() => import("./pages/AISettings"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const SmartActionsAnalytics = React.lazy(() => import("./pages/SmartActionsAnalytics"));

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
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>}>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/drafts" element={<ProtectedRoute><Repository /></ProtectedRoute>} />
                    <Route path="/repository" element={<ProtectedRoute><Repository /></ProtectedRoute>} />
                    <Route path="/content-builder" element={<ProtectedRoute><ContentBuilderPage /></ProtectedRoute>} />
                    <Route path="/content-repurposing" element={<ProtectedRoute><ContentRepurposing /></ProtectedRoute>} />
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
                    <Route path="/research/keyword-research" element={<ProtectedRoute><KeywordResearch /></ProtectedRoute>} />
                    <Route path="/research/answer-the-people" element={<ProtectedRoute><AnswerThePeople /></ProtectedRoute>} />
                    <Route path="/research/topic-clusters" element={<ProtectedRoute><TopicClusters /></ProtectedRoute>} />
                    <Route path="/research/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
                    <Route path="/research/opportunity-hunter" element={<Navigate to="/research/opportunities" replace />} />
                    
                     <Route path="/research/content-gaps" element={<ProtectedRoute><ContentGapsPage /></ProtectedRoute>} />
                     <Route path="/research/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                     <Route path="/research/pipeline" element={<ProtectedRoute><PipelinePage /></ProtectedRoute>} />
                    
                    {/* AIO/GEO route */}
                    <Route path="/aio-geo" element={<ProtectedRoute><AioGeo /></ProtectedRoute>} />

                    {/* Smart Actions Analytics */}
                    <Route path="/smart-actions/analytics" element={<ProtectedRoute><SmartActionsAnalytics /></ProtectedRoute>} />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <FloatingFeedbackButton />
              </BrowserRouter>
            </TourProvider>
          </FeedbackProvider>
        </ContentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
