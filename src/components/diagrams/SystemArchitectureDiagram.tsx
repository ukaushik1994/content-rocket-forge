import React from 'react';

// Declare the lov-mermaid component for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lov-mermaid': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const SystemArchitectureDiagram = () => {
  return (
    <div className="w-full p-6 bg-gradient-to-br from-background to-muted rounded-lg border">
      <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
        AI Chat System Architecture
      </h2>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <lov-mermaid>
            {`flowchart TD
              %% User Interface Layer
              UI[👤 User Interface<br/>AI Chat Page] --> ChatInterface[🤖 Enhanced Chat Interface]
              
              %% Frontend Integration Layer - Phase 4
              ChatInterface --> AIChatIntegrator[🔗 AI Chat Integrator<br/>Service Orchestration]
              ChatInterface --> IntegrationStatus[📊 Integration Status Panel<br/>Real-time Service Monitoring]
              
              %% Core AI Infrastructure - Phase 1
              AIChatIntegrator --> AIProxy[🎯 AI Proxy Service<br/>Intelligent Routing & Provider Selection]
              AIChatIntegrator --> ContextManager[🧠 AI Context Manager<br/>Conversation Memory & State]
              
              %% Content Processing Services - Phase 2
              AIChatIntegrator --> ContentStrategy[📈 Content Strategy Engine<br/>SERP Analysis & Keyword Research]
              AIChatIntegrator --> ContentGenerator[✍️ OpenRouter Content Generator<br/>Advanced Content Creation]
              
              %% Analytics & Data Services - Phase 3
              AIChatIntegrator --> AnalyticsService[📊 Google Analytics Integration<br/>Performance Tracking]
              AIChatIntegrator --> SearchConsole[🔍 Search Console Service<br/>SEO Data & Insights]
              AIChatIntegrator --> DashboardSummary[📋 Dashboard Summary<br/>Intelligent Data Aggregation]
              
              %% Backend Database Layer
              ContextManager --> DB[(🗄️ Supabase Database<br/>Conversations, Messages, Context)]
              ContentStrategy --> DB
              ContentGenerator --> DB
              AnalyticsService --> DB
              
              %% External API Layer
              AIProxy --> OpenAI[🤖 OpenAI API<br/>GPT Models]
              AIProxy --> Gemini[💎 Google Gemini API<br/>Advanced Reasoning]
              AIProxy --> LovableAI[⚡ Lovable AI Gateway<br/>Multi-Model Access]
              
              ContentStrategy --> SerpAPI[🔍 SERP API<br/>Search Results Analysis]
              ContentGenerator --> OpenRouter[🌐 OpenRouter API<br/>Multiple AI Providers]
              AnalyticsService --> GoogleAPI[📊 Google Analytics API<br/>Website Performance]
              SearchConsole --> GSCApi[🔍 Google Search Console API<br/>Search Performance Data]
              
              %% Intelligence & Decision Layer
              AIChatIntegrator --> DecisionEngine{🧠 Intelligent Router<br/>Message Analysis & Service Selection}
              DecisionEngine --> |Content Strategy Keywords| ContentStrategy
              DecisionEngine --> |Content Generation Requests| ContentGenerator
              DecisionEngine --> |Analytics Questions| AnalyticsService
              DecisionEngine --> |Performance Queries| SearchConsole
              DecisionEngine --> |Summary Requests| DashboardSummary
              DecisionEngine --> |General Chat| AIProxy
              
              %% Response Aggregation
              ContentStrategy --> ResponseAggregator[🔄 Response Aggregator<br/>Multi-Service Integration]
              ContentGenerator --> ResponseAggregator
              AnalyticsService --> ResponseAggregator
              SearchConsole --> ResponseAggregator
              DashboardSummary --> ResponseAggregator
              AIProxy --> ResponseAggregator
              
              ResponseAggregator --> ChatInterface
              
              %% Visual Enhancement
              ResponseAggregator --> VisualEnhancer[🎨 Visual Data Processor<br/>Charts, Actions, Insights]
              VisualEnhancer --> ChatInterface
              
              %% Styling
              classDef phaseOne fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,color:#000
              classDef phaseTwo fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
              classDef phaseThree fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000
              classDef phaseFour fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
              classDef external fill:#ffecec,stroke:#d32f2f,stroke-width:2px,color:#000
              classDef database fill:#f0f4f8,stroke:#455a64,stroke-width:3px,color:#000
              classDef user fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#000
              
              %% Apply styles
              class AIProxy,ContextManager phaseOne
              class ContentStrategy,ContentGenerator phaseTwo
              class AnalyticsService,SearchConsole,DashboardSummary phaseThree
              class AIChatIntegrator,IntegrationStatus,ChatInterface phaseFour
              class OpenAI,Gemini,LovableAI,SerpAPI,OpenRouter,GoogleAPI,GSCApi external
              class DB database
              class UI user
              class DecisionEngine,ResponseAggregator,VisualEnhancer phaseFour`}
          </lov-mermaid>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#e1f5fe] border-2 border-[#0277bd]"></div>
          <span className="text-foreground">Phase 1: Core AI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#f3e5f5] border-2 border-[#7b1fa2]"></div>
          <span className="text-foreground">Phase 2: Content</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#e8f5e8] border-2 border-[#388e3c]"></div>
          <span className="text-foreground">Phase 3: Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#fff3e0] border-2 border-[#f57c00]"></div>
          <span className="text-foreground">Phase 4: Integration</span>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitectureDiagram;