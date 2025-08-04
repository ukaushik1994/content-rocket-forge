
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ContentBuilderProvider } from "@/contexts/ContentBuilderContext";
import { GlossaryBuilderProvider } from "@/contexts/glossary-builder/GlossaryBuilderContext";
import { ContentProvider } from "@/contexts/content/ContentProvider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Logout from "@/pages/Logout";
import KeywordResearch from "@/pages/research/KeywordResearch";
import ContentStrategy from "@/pages/research/ContentStrategy";
import ContentCalendar from "@/pages/content/ContentCalendar";
import ContentPipeline from "@/pages/content/ContentPipeline";
import ContentList from "@/pages/content/ContentList";
import ContentDetail from "@/pages/content/ContentDetail";
import ContentBuilder from "@/pages/content/ContentBuilder";
import GlossaryBuilder from "@/pages/glossary/GlossaryBuilder";
import AnalyticsDashboard from "@/pages/analytics/AnalyticsDashboard";
import ApprovalWorkflow from "@/pages/approval/ApprovalWorkflow";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GuestRoute from "@/components/auth/GuestRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ContentProvider>
                <ContentBuilderProvider>
                  <GlossaryBuilderProvider>
                    <Router>
                      <div className="min-h-screen bg-background">
                        <ErrorBoundary>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route path="/contact" element={<Contact />} />
                            
                            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                            <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
                            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
                            <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
                            
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                            <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
                            
                            <Route path="/research/keyword-research" element={<ProtectedRoute><KeywordResearch /></ProtectedRoute>} />
                            <Route path="/research/content-strategy" element={<ProtectedRoute><ContentStrategy /></ProtectedRoute>} />
                            
                            <Route path="/content/calendar" element={<ProtectedRoute><ContentCalendar /></ProtectedRoute>} />
                            <Route path="/content/pipeline" element={<ProtectedRoute><ContentPipeline /></ProtectedRoute>} />
                            <Route path="/content/list" element={<ProtectedRoute><ContentList /></ProtectedRoute>} />
                            <Route path="/content/detail/:id" element={<ProtectedRoute><ContentDetail /></ProtectedRoute>} />
                            <Route path="/content-builder" element={<ProtectedRoute><ContentBuilder /></ProtectedRoute>} />
                            
                            <Route path="/glossary-builder" element={<ProtectedRoute><GlossaryBuilder /></ProtectedRoute>} />
                            
                            <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                            
                            <Route path="/approval-workflow" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
                            
                            <Route path="/unauthorized" element={<Unauthorized />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </ErrorBoundary>
                      </div>
                      <Toaster richColors position="top-right" />
                    </Router>
                  </GlossaryBuilderProvider>
                </ContentBuilderProvider>
              </ContentProvider>
            </AuthProvider>
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
