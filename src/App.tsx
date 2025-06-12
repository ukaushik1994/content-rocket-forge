
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
import Solutions from "./pages/Solutions";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Advocacy from "./pages/Advocacy";
import EmployeeAdvocacy from "./pages/EmployeeAdvocacy";
import AdminAdvocacy from "./pages/AdminAdvocacy";
import NotFound from "./pages/NotFound";
import { ContentProvider } from "./contexts/content";
import { AuthProvider } from "./contexts/AuthContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { FloatingFeedbackButton } from "./components/feedback/FloatingFeedbackButton";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

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
                
                {/* Employee-only routes */}
                <Route 
                  path="/employee-advocacy" 
                  element={
                    <RoleProtectedRoute allowedRoles={['employee']}>
                      <EmployeeAdvocacy />
                    </RoleProtectedRoute>
                  } 
                />
                
                {/* Admin-only routes */}
                <Route 
                  path="/" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <Index />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/drafts" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <Drafts />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/content-builder" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <ContentBuilder />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/content-repurposing" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <ContentRepurposing />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/content-approval" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <ContentApproval />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/solutions" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <Solutions />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <Analytics />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/advocacy" 
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <AdminAdvocacy />
                    </RoleProtectedRoute>
                  } 
                />
                
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
