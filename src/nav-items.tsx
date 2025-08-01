
import Index from "./pages/Index.tsx";
import ContentBuilderPage from "./pages/ContentBuilderPage.tsx";
import SolutionsPage from "./pages/SolutionsPage.tsx";
import AiChatPage from "./pages/AiChatPage.tsx";
import AnalyticsPage from "./pages/AnalyticsPage.tsx";
import ContentRepurposingPage from "./pages/ContentRepurposingPage.tsx";
import ContentAnalysisPage from "./pages/ContentAnalysisPage.tsx";
import SerpAnalysisPage from "./pages/SerpAnalysisPage.tsx";
import CompetitorAnalysisPage from "./pages/CompetitorAnalysisPage.tsx";
import LinkBuildingPage from "./pages/LinkBuildingPage.tsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    page: <Index />,
  },
  {
    title: "Content Builder",
    to: "/content-builder",
    page: <ContentBuilderPage />,
  },
  {
    title: "Solutions",
    to: "/solutions",
    page: <SolutionsPage />,
  },
  {
    title: "AI Chat",
    to: "/ai-chat",
    page: <AiChatPage />,
  },
  {
    title: "Analytics",
    to: "/analytics",
    page: <AnalyticsPage />,
  },
  {
    title: "Content Repurposing",
    to: "/content-repurposing",
    page: <ContentRepurposingPage />,
  },
  {
    title: "Content Analysis",
    to: "/content-analysis",
    page: <ContentAnalysisPage />,
  },
  {
    title: "SERP Analysis",
    to: "/serp-analysis",
    page: <SerpAnalysisPage />,
  },
  {
    title: "Competitor Analysis",
    to: "/competitor-analysis",
    page: <CompetitorAnalysisPage />,
  },
  {
    title: "Link Building",
    to: "/link-building",
    page: <LinkBuildingPage />,
  },
];
