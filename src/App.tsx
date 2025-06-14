
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ContentBuilder from "./pages/ContentBuilder";
import Settings from "./pages/Settings";
import AIAssistant from "./pages/AIAssistant";
import Analytics from "./pages/Analytics";
import Solutions from "./pages/Solutions";
import Drafts from "./pages/Drafts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/content-builder" element={<ContentBuilder />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/drafts" element={<Drafts />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
