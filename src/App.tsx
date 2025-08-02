
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/content/ContentProvider';
import { SettingsProvider } from './contexts/SettingsContext';

// Layout Components
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ContentBuilderPage from './pages/ContentBuilderPage';
import ContentRepositoryPage from './pages/ContentRepositoryPage';
import ContentRepurposingPage from './pages/ContentRepurposingPage';
import PipelinePage from './pages/PipelinePage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ResearchPage from './pages/ResearchPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <ContentProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout>
                        <HomePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/content-builder" element={
                    <ProtectedRoute>
                      <Layout>
                        <ContentBuilderPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/repository" element={
                    <ProtectedRoute>
                      <Layout>
                        <ContentRepositoryPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/content-repurposing" element={
                    <ProtectedRoute>
                      <Layout>
                        <ContentRepurposingPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/pipeline" element={
                    <ProtectedRoute>
                      <Layout>
                        <PipelinePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <Layout>
                        <CalendarPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Layout>
                        <AnalyticsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/research" element={
                    <ProtectedRoute>
                      <Layout>
                        <ResearchPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
                <Toaster position="top-right" />
              </div>
            </Router>
          </ContentProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
