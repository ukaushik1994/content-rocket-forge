
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/content/ContentProvider';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';

// Create placeholder pages for missing pages
import ContentBuilderPage from './pages/ContentBuilder';
import InterlinkingPage from './pages/InterlinkingPage';
import Drafts from './pages/Drafts';

const queryClient = new QueryClient();

// Create placeholder component for ProtectedRoute
const ProtectedRoute = ({ children }) => children;

// Create placeholder components for missing pages
const Dashboard = () => <div>Dashboard Page</div>;
const ContentLibrary = () => <div>Content Library Page</div>;
const LoginPage = () => <div>Login Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const ProfilePage = () => <div>Profile Page</div>;

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
                  <Route path="/dashboard" element={<ProtectedRoute>{<Dashboard />}</ProtectedRoute>} />
                  <Route path="/content-builder" element={<ProtectedRoute>{<ContentBuilderPage />}</ProtectedRoute>} />
                  <Route path="/content" element={<ProtectedRoute>{<ContentLibrary />}</ProtectedRoute>} />
                  <Route path="/drafts" element={<ProtectedRoute>{<Drafts />}</ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute>{<ProfilePage />}</ProtectedRoute>} />
                  <Route path="/interlinking" element={<ProtectedRoute>{<InterlinkingPage />}</ProtectedRoute>} />
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
