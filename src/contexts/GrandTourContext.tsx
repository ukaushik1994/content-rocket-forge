
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TourStep {
  id: string;
  title: string;
  description: React.ReactNode;
  phase: 'welcome' | 'dashboard' | 'creation' | 'optimization' | 'research' | 'analytics' | 'ai-mode';
  icon?: React.ReactNode;
  gradient: string;
  particles: 'cosmic' | 'content' | 'data' | 'ai';
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
}

interface GrandTourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  achievements: Achievement[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  goToStep: (step: number) => void;
  hasCompletedTour: boolean;
  unlockAchievement: (id: string) => void;
}

const GrandTourContext = createContext<GrandTourContextType | undefined>(undefined);

export const useGrandTour = () => {
  const context = useContext(GrandTourContext);
  if (!context) {
    throw new Error('useGrandTour must be used within a GrandTourProvider');
  }
  return context;
};

export const GrandTourProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem('grand-tour-completed') === 'true';
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('tour-achievements');
    return saved ? JSON.parse(saved) : [
      { id: 'explorer', name: 'Content Explorer', icon: '🚀', unlocked: false },
      { id: 'strategist', name: 'Content Strategist', icon: '🎯', unlocked: false },
      { id: 'researcher', name: 'SEO Researcher', icon: '🔍', unlocked: false },
      { id: 'analyst', name: 'Performance Analyst', icon: '📊', unlocked: false },
      { id: 'ai-master', name: 'AI Master', icon: '🤖', unlocked: false },
    ];
  });

  const steps: TourStep[] = [
    {
      id: 'grand-welcome',
      title: '🚀 Welcome to CreAiter',
      phase: 'welcome',
      gradient: 'from-neon-purple via-neon-blue to-neon-pink',
      particles: 'cosmic',
      description: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
              The Ultimate AI Content Creation Platform
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-neon-blue">10+</div>
              <div className="text-sm text-white/70">Integrated Modules</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-neon-purple">AI</div>
              <div className="text-sm text-white/70">Powered Engine</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-neon-pink">SERP</div>
              <div className="text-sm text-white/70">Integration</div>
            </div>
          </div>
          <p className="text-center text-white/80">
            Generate high-ranking, conversion-driven content with real-time SERP data and AI optimization. 
            This tour will show you every powerful feature at your disposal.
          </p>
        </div>
      ),
    },
    {
      id: 'dashboard-command',
      title: '🎛️ Your Command Center',
      phase: 'dashboard',
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      particles: 'cosmic',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🎛️</div>
            <h3 className="text-xl font-bold">Dashboard Overview</h3>
          </div>
          <div className="space-y-3">
            <p>This is your central command hub where everything happens:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span><strong>Real-time Analytics:</strong> Performance metrics at a glance</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span><strong>Quick Actions:</strong> Instant access to all features</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span><strong>Smart Navigation:</strong> Context-aware module switching</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'quick-actions-hub',
      title: '⚡ Quick Actions Hub',
      phase: 'dashboard',
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      particles: 'content',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-xl font-bold">Instant Feature Access</h3>
          </div>
          <p>These action cards give you one-click access to your most powerful tools:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-neon-purple/20 to-transparent border border-white/10">
              <div className="font-semibold">Content Builder</div>
              <div className="text-sm text-white/70">AI-powered creation</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-neon-blue/20 to-transparent border border-white/10">
              <div className="font-semibold">Keyword Research</div>
              <div className="text-sm text-white/70">SERP analysis</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-neon-pink/20 to-transparent border border-white/10">
              <div className="font-semibold">Analytics</div>
              <div className="text-sm text-white/70">Performance insights</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-400/20 to-transparent border border-white/10">
              <div className="font-semibold">Repurposing</div>
              <div className="text-sm text-white/70">Multi-format content</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'content-builder',
      title: '🏗️ Content Builder Engine',
      phase: 'creation',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      particles: 'content',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🏗️</div>
            <h3 className="text-xl font-bold">AI-Powered Content Creation</h3>
          </div>
          <p>Our flagship 6-step content creation process:</p>
          <div className="space-y-2">
            {[
              '1. Topic Research & SERP Analysis',
              '2. Keyword Integration & Intent Mapping',
              '3. Outline Generation & Structure Planning',
              '4. AI Content Writing & Optimization',
              '5. SEO Enhancement & Meta Creation',
              '6. Quality Review & Publishing Prep'
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-sm">{step.substring(3)}</span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-400/10 to-teal-500/10 border border-emerald-400/20">
            <p className="text-sm"><strong>🎯 Smart Feature:</strong> Real-time SERP integration ensures your content targets the right keywords and outranks competitors.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'drafts-management',
      title: '📝 Drafts & Content Library',
      phase: 'creation',
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      particles: 'content',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">📝</div>
            <h3 className="text-xl font-bold">Organized Content Management</h3>
          </div>
          <p>Your personal content library with advanced organization:</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">📄</span>
              </div>
              <div>
                <div className="font-semibold">Version Control</div>
                <div className="text-sm text-white/70">Track changes and iterations</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">👥</span>
              </div>
              <div>
                <div className="font-semibold">Team Collaboration</div>
                <div className="text-sm text-white/70">Share and co-edit with teammates</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">⏰</span>
              </div>
              <div>
                <div className="font-semibold">Auto-Save & Backup</div>
                <div className="text-sm text-white/70">Never lose your work again</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'content-approval',
      title: '✅ Approval Workflows',
      phase: 'creation',
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      particles: 'content',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-xl font-bold">Quality Control & Team Reviews</h3>
          </div>
          <p>Streamlined approval process for team-based content creation:</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">1</div>
                <span>Draft Submission</span>
              </div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">2</div>
                <span>Reviewer Assignment</span>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">3</div>
                <span>Quality Check & Approval</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-400/10 to-emerald-500/10 border border-green-400/20">
            <p className="text-sm"><strong>🎯 Smart Feature:</strong> Automated quality scoring and SEO compliance checking before approval.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'content-repurposing',
      title: '🔄 Content Repurposing',
      phase: 'optimization',
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      particles: 'content',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🔄</div>
            <h3 className="text-xl font-bold">Multi-Format Content Transformation</h3>
          </div>
          <p>Transform one piece of content into multiple formats:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/30">
              <div className="font-semibold text-blue-300">📄 → 📱</div>
              <div className="text-sm text-white/70">Blog to Social Posts</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/30">
              <div className="font-semibold text-green-300">📄 → 📧</div>
              <div className="text-sm text-white/70">Article to Newsletter</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30">
              <div className="font-semibold text-purple-300">📄 → 🎥</div>
              <div className="text-sm text-white/70">Content to Video Script</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-transparent border border-pink-500/30">
              <div className="font-semibold text-pink-300">📄 → 📊</div>
              <div className="text-sm text-white/70">Data to Infographic</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-400/10 to-pink-500/10 border border-purple-400/20">
            <p className="text-sm"><strong>🎯 Smart Feature:</strong> Platform-specific optimization ensures content performs well on each channel.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'content-strategy',
      title: '🎯 Content Strategy Dashboard',
      phase: 'optimization',
      gradient: 'from-indigo-400 via-purple-500 to-pink-500',
      particles: 'data',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="text-xl font-bold">Strategic Content Planning</h3>
          </div>
          <p>Comprehensive strategy dashboard for long-term success:</p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📈</span>
                <strong>Goal Tracking</strong>
              </div>
              <div className="text-sm text-white/70">Set and monitor content performance goals with predictive analytics</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏆</span>
                <strong>Competitor Analysis</strong>
              </div>
              <div className="text-sm text-white/70">Monitor competitor content strategies and identify opportunities</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📅</span>
                <strong>Content Calendar</strong>
              </div>
              <div className="text-sm text-white/70">Strategic scheduling with seasonal trends and audience insights</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'keyword-research',
      title: '🔍 Keyword Research Engine',
      phase: 'research',
      gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      particles: 'data',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-xl font-bold">Advanced SERP Analysis</h3>
          </div>
          <p>Powerful keyword discovery and analysis tools:</p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-400/10 to-blue-500/10 border border-cyan-400/20">
              <div className="font-semibold flex items-center gap-2">
                <span className="text-cyan-400">🎯</span>
                Real-time SERP Data
              </div>
              <div className="text-sm text-white/70 mt-1">Live search result analysis with ranking opportunities</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
              <div className="font-semibold flex items-center gap-2">
                <span className="text-blue-400">🔄</span>
                Keyword Clustering
              </div>
              <div className="text-sm text-white/70 mt-1">Semantic keyword grouping for topic authority</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="font-semibold flex items-center gap-2">
                <span className="text-indigo-400">📊</span>
                Competition Analysis
              </div>
              <div className="text-sm text-white/70 mt-1">Identify content gaps and ranking opportunities</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'answer-the-people',
      title: '❓ Answer The People',
      phase: 'research',
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      particles: 'data',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">❓</div>
            <h3 className="text-xl font-bold">Question Discovery Engine</h3>
          </div>
          <p>Discover what your audience is actually asking:</p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-orange-400/10 to-red-500/10 border border-orange-400/20">
              <div className="font-semibold">🔍 Question Mining</div>
              <div className="text-sm text-white/70 mt-1">Extract questions from People Also Ask, Reddit, Quora, and forums</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
              <div className="font-semibold">🎯 Intent Analysis</div>
              <div className="text-sm text-white/70 mt-1">Categorize questions by search intent and conversion potential</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
              <div className="font-semibold">📝 Content Ideas</div>
              <div className="text-sm text-white/70 mt-1">Transform questions into content outlines and article structures</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-orange-400/5 to-pink-500/5">
            <div className="text-2xl">💡</div>
            <div className="text-sm">Creates content that directly answers your audience's questions!</div>
          </div>
        </div>
      ),
    },
    {
      id: 'topic-clusters',
      title: '🕸️ Topic Clusters & Content Pillars',
      phase: 'research',
      gradient: 'from-teal-400 via-cyan-500 to-blue-600',
      particles: 'data',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🕸️</div>
            <h3 className="text-xl font-bold">Semantic Content Architecture</h3>
          </div>
          <p>Build topical authority with interconnected content clusters:</p>
          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold">Pillar</span>
                </div>
                <div className="flex flex-col space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500/50 to-blue-500/50 flex items-center justify-center">
                      <span className="text-white text-xs">Sub</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  <defs>
                    <linearGradient id="connection" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.2"/>
                    </linearGradient>
                  </defs>
                  <line x1="25%" y1="50%" x2="75%" y2="30%" stroke="url(#connection)" strokeWidth="2"/>
                  <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="url(#connection)" strokeWidth="2"/>
                  <line x1="25%" y1="50%" x2="75%" y2="70%" stroke="url(#connection)" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                <span><strong>Pillar Content:</strong> Comprehensive topic coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                <span><strong>Cluster Content:</strong> Supporting subtopics and questions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span><strong>Internal Linking:</strong> SEO-optimized connections</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'solutions-management',
      title: '🛠️ Solutions & Brand Management',
      phase: 'research',
      gradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
      particles: 'content',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🛠️</div>
            <h3 className="text-xl font-bold">Product & Service Integration</h3>
          </div>
          <p>Seamlessly integrate your products and services into content:</p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-violet-400/10 to-purple-500/10 border border-violet-400/20">
              <div className="font-semibold">🎨 Brand Guidelines</div>
              <div className="text-sm text-white/70 mt-1">Maintain consistent brand voice, tone, and messaging</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20">
              <div className="font-semibold">📦 Product Database</div>
              <div className="text-sm text-white/70 mt-1">Manage solutions, features, and benefits for content integration</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 border border-fuchsia-500/20">
              <div className="font-semibold">💰 ROI Tracking</div>
              <div className="text-sm text-white/70 mt-1">Monitor how content drives product awareness and conversions</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-violet-400/5 to-fuchsia-500/5">
            <div className="text-2xl">🎯</div>
            <div className="text-sm">Automatically suggests relevant products for each piece of content!</div>
          </div>
        </div>
      ),
    },
    {
      id: 'analytics-dashboard',
      title: '📊 Analytics & Performance',
      phase: 'analytics',
      gradient: 'from-emerald-400 via-green-500 to-teal-600',
      particles: 'data',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-xl font-bold">Comprehensive Performance Intelligence</h3>
          </div>
          <p>Track, analyze, and optimize your content performance:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-400/10 to-green-500/10 border border-emerald-400/20">
              <div className="font-semibold text-emerald-300">📈 SEO Metrics</div>
              <div className="text-xs text-white/70">Rankings, traffic, CTR</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20">
              <div className="font-semibold text-green-300">💬 Engagement</div>
              <div className="text-xs text-white/70">Shares, comments, time</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
              <div className="font-semibold text-teal-300">💰 Conversions</div>
              <div className="text-xs text-white/70">Leads, sales, ROI</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="font-semibold text-cyan-300">🎯 Attribution</div>
              <div className="text-xs text-white/70">Content to revenue</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-400/10 to-teal-500/10 border border-emerald-400/20">
            <p className="text-sm"><strong>🤖 AI Insights:</strong> Automated performance reports with actionable recommendations for improvement.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'ai-mode-introduction',
      title: '🤖 AI Conversational Mode',
      phase: 'ai-mode',
      gradient: 'from-pink-400 via-purple-500 to-indigo-600',
      particles: 'ai',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4 animate-pulse">🤖</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              The Future of Content Creation
            </h3>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-pink-400/10 via-purple-500/10 to-indigo-600/10 border border-purple-400/30">
            <div className="text-center mb-3">
              <div className="text-lg font-bold">✨ Skip All The Manual Work ✨</div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                <span><strong>"Create a blog post about AI in healthcare"</strong> → Full article with SEO</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span><strong>"Research competitors for 'digital marketing'"</strong> → Complete analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <span><strong>"Turn this into social media posts"</strong> → Multi-platform content</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-400/20 to-indigo-600/20 border border-purple-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Just talk to your AI assistant and watch magic happen!</span>
            </div>
          </div>
          <div className="text-center text-white/80 text-sm">
            <p><strong>🚀 Ready to experience effortless content creation?</strong></p>
            <p>Start by describing what you want to create, and let AI handle the rest!</p>
          </div>
        </div>
      ),
    },
  ];

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompletedTour(true);
    localStorage.setItem('grand-tour-completed', 'true');
    unlockAchievement('ai-master');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Unlock achievements based on progress
      const progress = (currentStep + 1) / steps.length;
      if (progress >= 0.2) unlockAchievement('explorer');
      if (progress >= 0.4) unlockAchievement('strategist');
      if (progress >= 0.6) unlockAchievement('researcher');
      if (progress >= 0.8) unlockAchievement('analyst');
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    endTour();
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => 
        achievement.id === id ? { ...achievement, unlocked: true } : achievement
      );
      localStorage.setItem('tour-achievements', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <GrandTourContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        achievements,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        goToStep,
        hasCompletedTour,
        unlockAchievement,
      }}
    >
      {children}
    </GrandTourContext.Provider>
  );
};
