import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { HelmetProvider } from 'react-helmet-async';

import Dashboard from '@/pages/Dashboard';
import ContentBuilderPage from '@/pages/ContentBuilder';
import ContentApproval from '@/pages/content/ContentApproval';
import ContentDrafts from '@/pages/content/ContentDrafts';
import ContentPublished from '@/pages/content/ContentPublished';
import TopicClusters from '@/pages/content/TopicClusters';
import SeoOptimization from '@/pages/content/SeoOptimization';
import SerpData from '@/pages/serp/SerpData';
import SerpAnalysis from '@/pages/serp/SerpAnalysis';
import Analytics from '@/pages/Analytics';

// Create a query client
// Documentation: https://tanstack.com/query/v4/docs/react/reference/QueryClient
// Usage:
// 1. Wrap your app with <QueryClientProvider client={queryClient}>
// 2. Use the useQuery hook to fetch data
//    const { data, isLoading, error } = useQuery(['todos'], fetchTodos)
// 3. Use the useMutation hook to update data
//    const mutation = useMutation(updateTodo)
//    mutation.mutate({ id: 1, title: 'New Title' })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/content-builder" element={<ContentBuilderPage />} />
                <Route path="/content/approval" element={<ContentApproval />} />
                <Route path="/content/drafts" element={<ContentDrafts />} />
                <Route path="/content/published" element={<ContentPublished />} />
                <Route path="/content/topic-clusters" element={<TopicClusters />} />
                <Route path="/content/seo-optimization" element={<SeoOptimization />} />
                <Route path="/serp/data" element={<SerpData />} />
                <Route path="/serp/analysis" element={<SerpAnalysis />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
