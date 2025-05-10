import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/content/ContentProvider';
import Dashboard from './pages/Dashboard';
import ContentBuilderPage from './pages/ContentBuilder';
import ContentLibrary from './pages/ContentLibrary';
import Drafts from './pages/Drafts';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import FeedbackProvider from './contexts/FeedbackContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import InterlinkingPage from './pages/InterlinkingPage';

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <FeedbackProvider>
          <QueryClientProvider client={queryClient}>
            <HelmetProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/content-builder" element={<ProtectedRoute><ContentBuilderPage /></ProtectedRoute>} />
                  <Route path="/content" element={<ProtectedRoute><ContentLibrary /></ProtectedRoute>} />
                  <Route path="/drafts" element={<ProtectedRoute><Drafts /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/interlinking" element={<ProtectedRoute><InterlinkingPage /></ProtectedRoute>} />
                </Routes>
              </Router>
              <Toaster position="top-right" />
            </HelmetProvider>
          </QueryClientProvider>
        </FeedbackProvider>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
