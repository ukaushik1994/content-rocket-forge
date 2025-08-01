
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Drafts from "./pages/Drafts";
import ContentBuilder from "./pages/ContentBuilder";
import ContentRepurposing from "./pages/ContentRepurposing";
import ContentApproval from "./pages/ContentApproval";
import GlossaryBuilder from "./pages/GlossaryBuilder";
import Solutions from "./pages/Solutions";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import ContentStrategy from "./pages/research/ContentStrategy";
import KeywordResearch from "./pages/research/KeywordResearch";
import AnswerThePeople from "./pages/research/AnswerThePeople";
import TopicClusters from "./pages/research/TopicClusters";
import AioGeo from "./pages/AioGeo";
import AIChat from "./pages/AIChat";
import NotFound from "./pages/NotFound";
import { ContentProvider } from "./contexts/content";
import { AuthProvider } from "./contexts/AuthContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { FloatingFeedbackButton } from "./components/feedback/FloatingFeedbackButton";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ContentProvider>
          <FeedbackProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/drafts" element={<ProtectedRoute><Drafts /></ProtectedRoute>} />
                <Route path="/content-builder" element={<ProtectedRoute><ContentBuilder /></ProtectedRoute>} />
                <Route path="/content-repurposing" element={<ProtectedRoute><ContentRepurposing /></ProtectedRoute>} />
                <Route path="/content-approval" element={<ProtectedRoute><ContentApproval /></ProtectedRoute>} />
                <Route path="/glossary-builder" element={<ProtectedRoute><GlossaryBuilder /></ProtectedRoute>} />
                <Route path="/solutions" element={<ProtectedRoute><Solutions /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                
                {/* AI Chat route */}
                <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
                
                {/* Research routes */}
                <Route path="/research/content-strategy" element={<ProtectedRoute><ContentStrategy /></ProtectedRoute>} />
                <Route path="/research/keyword-research" element={<ProtectedRoute><KeywordResearch /></ProtectedRoute>} />
                <Route path="/research/answer-the-people" element={<ProtectedRoute><AnswerThePeople /></ProtectedRoute>} />
                <Route path="/research/topic-clusters" element={<ProtectedRoute><TopicClusters /></ProtectedRoute>} />
                
                {/* AIO/GEO route */}
                <Route path="/aio-geo" element={<ProtectedRoute><AioGeo /></ProtectedRoute>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <FloatingFeedbackButton />
            </BrowserRouter>
          </FeedbackProvider>
        </ContentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
