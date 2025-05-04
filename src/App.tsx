
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Content from "./pages/Content";
import ContentBuilder from "./pages/ContentBuilder";
import Solutions from "./pages/Solutions";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
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
                <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
                <Route path="/content-builder" element={<ProtectedRoute><ContentBuilder /></ProtectedRoute>} />
                <Route path="/solutions" element={<ProtectedRoute><Solutions /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                
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
