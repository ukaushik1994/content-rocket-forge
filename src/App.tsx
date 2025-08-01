
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Layout from "./components/layout/Layout";
import SeoOptimizationPage from "./pages/SeoOptimizationPage";
import ContentTemplatesPage from "./pages/ContentTemplatesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Layout>
          <Routes>
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
            <Route path="/seo-tools" element={<SeoOptimizationPage />} />
            <Route path="/templates" element={<ContentTemplatesPage />} />
            <Route path="/templates/:category" element={<ContentTemplatesPage />} />
            <Route path="/templates/builder" element={<ContentTemplatesPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
