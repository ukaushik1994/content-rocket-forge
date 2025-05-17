
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/content';
import { FeedbackProvider } from './contexts/FeedbackContext';

// Routes
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import SettingsPage from './pages/Settings';
import KeywordResearchPage from './pages/Keywords';
import ContentBuilderPage from './pages/ContentBuilder';
import ContentPage from './pages/Content';
import NotFoundPage from './pages/NotFound';

// Create a react-query client
const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <AuthProvider>
              <ContentProvider>
                <FeedbackProvider>
                  <Router>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                      <Route path="/keywords" element={<ProtectedRoute><KeywordResearchPage /></ProtectedRoute>} />
                      <Route path="/content-builder" element={<ProtectedRoute><ContentBuilderPage /></ProtectedRoute>} />
                      <Route path="/content" element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Router>
                  {/* Add Sonner Toaster component */}
                  <Toaster position="bottom-right" />
                </FeedbackProvider>
              </ContentProvider>
            </AuthProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
