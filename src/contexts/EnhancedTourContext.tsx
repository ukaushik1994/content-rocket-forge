
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EnhancedTourStep {
  id: string;
  phase: 'welcome' | 'core' | 'management' | 'strategy' | 'intelligence' | 'ai-mode';
  title: string;
  subtitle?: string;
  description: React.ReactNode;
  selector?: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  route?: string;
  visualEffects?: {
    particles?: 'cosmic' | 'keywords' | 'content' | 'analytics';
    animation?: 'reveal' | 'morph' | 'constellation' | 'breathe';
    spotlight?: boolean;
    sound?: string;
  };
  interactiveElements?: Array<{
    id: string;
    label: string;
    action: () => void;
  }>;
  achievement?: {
    name: string;
    icon: string;
    description: string;
  };
}

interface EnhancedTourContextType {
  isActive: boolean;
  currentStep: number;
  currentPhase: string;
  steps: EnhancedTourStep[];
  achievements: string[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  goToStep: (step: number) => void;
  goToPhase: (phase: string) => void;
  hasCompletedTour: boolean;
  unlockAchievement: (achievement: string) => void;
  tourProgress: {
    current: number;
    total: number;
    phaseProgress: Record<string, number>;
  };
}

const EnhancedTourContext = createContext<EnhancedTourContextType | undefined>(undefined);

export const useEnhancedTour = () => {
  const context = useContext(EnhancedTourContext);
  if (!context) {
    throw new Error('useEnhancedTour must be used within an EnhancedTourProvider');
  }
  return context;
};

export const EnhancedTourProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem('enhanced-tour-completed') === 'true';
  });

  const steps: EnhancedTourStep[] = [
    // Phase 1: Grand Welcome
    {
      id: 'grand-welcome',
      phase: 'welcome',
      title: '🚀 Welcome to Content Rocket Forge',
      subtitle: 'The Universe of AI-Powered Content Creation',
      description: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🌌</div>
            <p className="text-lg font-semibold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
              Prepare for launch into the future of content creation!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="font-semibold text-green-400">10x Faster</div>
              <div className="text-white/70">Content creation speed</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="font-semibold text-blue-400">95% Accuracy</div>
              <div className="text-white/70">SEO optimization</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="font-semibold text-purple-400">∞ Creativity</div>
              <div className="text-white/70">AI-powered inspiration</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="font-semibold text-pink-400">$1M+ ROI</div>
              <div className="text-white/70">Generated for clients</div>
            </div>
          </div>
        </div>
      ),
      position: 'center',
      visualEffects: {
        particles: 'cosmic',
        animation: 'reveal',
        spotlight: true,
      },
      achievement: {
        name: 'Explorer',
        icon: '🌟',
        description: 'Started the grand tour'
      }
    },

    // Phase 2: Core Content Creation Engine
    {
      id: 'content-builder',
      phase: 'core',
      title: '🏗️ Content Builder - Your Creative Engine',
      description: (
        <div className="space-y-4">
          <p>The heart of Content Rocket Forge - where ideas transform into high-ranking content.</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded" />
              <span className="text-sm">6-Step AI-Guided Workflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-neon-blue to-neon-pink rounded" />
              <span className="text-sm">Real-time SERP Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-neon-pink to-neon-purple rounded" />
              <span className="text-sm">Auto SEO Optimization</span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-white/10">
            <div className="text-sm font-semibold">💡 Pro Tip</div>
            <div className="text-xs text-white/80">Start with a simple topic and watch AI create magic!</div>
          </div>
        </div>
      ),
      route: '/content-builder',
      visualEffects: {
        particles: 'content',
        animation: 'morph',
      },
      achievement: {
        name: 'Content Architect',
        icon: '🏗️',
        description: 'Discovered the Content Builder'
      }
    },

    {
      id: 'keyword-research',
      phase: 'core',
      title: '🔍 Keyword Research - Intelligence Engine',
      description: (
        <div className="space-y-4">
          <p>Uncover hidden opportunities with advanced SERP analysis and AI-powered insights.</p>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span>Real-time competitor analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span>AI keyword clustering</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span>Search intent analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔗</span>
              <span>Content gap identification</span>
            </div>
          </div>
        </div>
      ),
      route: '/research',
      visualEffects: {
        particles: 'keywords',
        animation: 'constellation',
      }
    },

    {
      id: 'answer-the-people',
      phase: 'core',
      title: '❓ Answer The People - Question Discovery',
      description: (
        <div className="space-y-4">
          <p>Discover what your audience is really asking and create content that answers their needs.</p>
          <div className="space-y-3">
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-sm font-semibold mb-1">Question Mining</div>
              <div className="text-xs text-white/70">Extract questions from Google's "People Also Ask"</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="text-sm font-semibold mb-1">Content Opportunities</div>
              <div className="text-xs text-white/70">Transform questions into winning content ideas</div>
            </div>
          </div>
        </div>
      ),
      route: '/research/answer-the-people',
      visualEffects: {
        particles: 'content',
      }
    },

    // Phase 3: Content Management Ecosystem
    {
      id: 'drafts-management',
      phase: 'management',
      title: '📝 Drafts - Your Content Library',
      description: (
        <div className="space-y-4">
          <p>Organize, version, and collaborate on all your content in one powerful workspace.</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="font-semibold">🗂️ Organization</div>
              <div className="text-xs text-white/70">Smart categorization</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold">⏱️ Version Control</div>
              <div className="text-xs text-white/70">Track all changes</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold">👥 Collaboration</div>
              <div className="text-xs text-white/70">Team workflows</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold">📊 Progress Tracking</div>
              <div className="text-xs text-white/70">Visual timelines</div>
            </div>
          </div>
        </div>
      ),
      route: '/drafts',
      achievement: {
        name: 'Librarian',
        icon: '📚',
        description: 'Mastered content organization'
      }
    },

    {
      id: 'content-repurposing',
      phase: 'management',
      title: '🔄 Content Repurposing - Maximize Your Investment',
      description: (
        <div className="space-y-4">
          <p>Transform one piece of content into multiple formats across different platforms.</p>
          <div className="space-y-2">
            <div className="text-sm">✨ Transform blog posts into:</div>
            <div className="pl-4 space-y-1 text-sm text-white/80">
              <div>📱 Social media posts</div>
              <div>🎥 Video scripts</div>
              <div>📧 Email campaigns</div>
              <div>🎙️ Podcast outlines</div>
              <div>📊 Infographic content</div>
            </div>
          </div>
        </div>
      ),
      route: '/content-repurposing',
      visualEffects: {
        animation: 'morph',
      }
    },

    // Phase 4: Advanced Strategy & Research
    {
      id: 'content-strategy',
      phase: 'strategy',
      title: '📈 Content Strategy - Your Strategic Compass',
      description: (
        <div className="space-y-4">
          <p>Plan, execute, and optimize your content strategy with AI-powered insights.</p>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3 rounded-lg">
              <div className="text-sm font-semibold">🎯 Goal Setting & Tracking</div>
              <div className="text-xs text-white/70">Set SMART goals and track progress</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-pink-500/10 p-3 rounded-lg">
              <div className="text-sm font-semibold">🏆 Competitive Analysis</div>
              <div className="text-xs text-white/70">Stay ahead of the competition</div>
            </div>
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-3 rounded-lg">
              <div className="text-sm font-semibold">📅 Content Calendar</div>
              <div className="text-xs text-white/70">Plan and schedule content</div>
            </div>
          </div>
        </div>
      ),
      route: '/research/content-strategy',
      achievement: {
        name: 'Strategist',
        icon: '🎯',
        description: 'Mastered content strategy'
      }
    },

    {
      id: 'topic-clusters',
      phase: 'strategy',
      title: '🕸️ Topic Clusters - Build Content Authority',
      description: (
        <div className="space-y-4">
          <p>Create interconnected content networks that dominate search results.</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-neon-purple rounded-full" />
              <span>Semantic keyword grouping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-neon-blue rounded-full" />
              <span>Content pillar identification</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-neon-pink rounded-full" />
              <span>Internal linking optimization</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-cyan-400 rounded-full" />
              <span>Authority building strategy</span>
            </div>
          </div>
        </div>
      ),
      route: '/research/topic-clusters',
      visualEffects: {
        particles: 'keywords',
        animation: 'constellation',
      }
    },

    // Phase 5: Business Intelligence
    {
      id: 'solutions-management',
      phase: 'intelligence',
      title: '🏢 Solutions - Business Integration',
      description: (
        <div className="space-y-4">
          <p>Align your content with your business solutions and track ROI.</p>
          <div className="space-y-2 text-sm">
            <div className="bg-white/5 p-2 rounded">
              <span className="font-semibold">🎯 Solution Mapping:</span> Connect content to products/services
            </div>
            <div className="bg-white/5 p-2 rounded">
              <span className="font-semibold">🏷️ Brand Guidelines:</span> Maintain consistency across content
            </div>
            <div className="bg-white/5 p-2 rounded">
              <span className="font-semibold">💰 ROI Tracking:</span> Measure content business impact
            </div>
          </div>
        </div>
      ),
      route: '/solutions',
      achievement: {
        name: 'Business Strategist',
        icon: '💼',
        description: 'Integrated business solutions'
      }
    },

    {
      id: 'analytics',
      phase: 'intelligence',
      title: '📊 Analytics - Performance Intelligence',
      description: (
        <div className="space-y-4">
          <p>Transform data into actionable insights with advanced analytics and reporting.</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-500/10 p-2 rounded border border-green-500/20">
              <div className="font-semibold text-green-400">📈 Rankings</div>
              <div className="text-xs">Track SEO performance</div>
            </div>
            <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20">
              <div className="font-semibold text-blue-400">👥 Engagement</div>
              <div className="text-xs">Monitor user interaction</div>
            </div>
            <div className="bg-purple-500/10 p-2 rounded border border-purple-500/20">
              <div className="font-semibold text-purple-400">💰 Revenue</div>
              <div className="text-xs">Attribution tracking</div>
            </div>
            <div className="bg-pink-500/10 p-2 rounded border border-pink-500/20">
              <div className="font-semibold text-pink-400">🔍 Insights</div>
              <div className="text-xs">AI-powered analysis</div>
            </div>
          </div>
        </div>
      ),
      route: '/analytics',
      visualEffects: {
        particles: 'analytics',
        animation: 'breathe',
      }
    },

    // Phase 6: AI Mode Grand Finale
    {
      id: 'ai-mode-finale',
      phase: 'ai-mode',
      title: '🤖 AI Conversational Mode - The Future is Here',
      description: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">✨🤖✨</div>
            <p className="text-lg font-semibold bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink bg-clip-text text-transparent">
              Welcome to Effortless Content Creation
            </p>
          </div>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-lg border border-white/20">
              <div className="text-sm font-semibold mb-2">🗣️ Natural Language Commands</div>
              <div className="text-xs text-white/80 italic">
                "Create a blog post about sustainable energy for my solar company"
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-pink-500/20 p-4 rounded-lg border border-white/20">
              <div className="text-sm font-semibold mb-2">🧠 Context-Aware AI</div>
              <div className="text-xs text-white/80">
                AI remembers your brand, previous content, and preferences
              </div>
            </div>
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 rounded-lg border border-white/20">
              <div className="text-sm font-semibold mb-2">🎯 Automated Workflows</div>
              <div className="text-xs text-white/80">
                From idea to published content - fully automated
              </div>
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 rounded-lg border border-white/10">
            <div className="text-lg font-bold text-white mb-1">Ready to Transform Your Content Creation?</div>
            <div className="text-sm text-white/70">Just start typing what you want to create...</div>
          </div>
        </div>
      ),
      position: 'center',
      visualEffects: {
        particles: 'cosmic',
        animation: 'reveal',
        spotlight: true,
      },
      achievement: {
        name: 'AI Master',
        icon: '🚀',
        description: 'Completed the grand tour'
      }
    }
  ];

  const currentPhase = steps[currentStep]?.phase || 'welcome';

  const tourProgress = {
    current: currentStep + 1,
    total: steps.length,
    phaseProgress: steps.reduce((acc, step, index) => {
      if (!acc[step.phase]) acc[step.phase] = 0;
      if (index <= currentStep) acc[step.phase]++;
      return acc;
    }, {} as Record<string, number>)
  };

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompletedTour(true);
    localStorage.setItem('enhanced-tour-completed', 'true');
    
    // Unlock final achievement
    if (achievements.length > 0) {
      unlockAchievement('Grand Master');
    }
  };

  const nextStep = () => {
    const currentStepData = steps[currentStep];
    
    // Unlock achievement if this step has one
    if (currentStepData.achievement) {
      unlockAchievement(currentStepData.achievement.name);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
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

  const goToPhase = (phase: string) => {
    const phaseStep = steps.findIndex(step => step.phase === phase);
    if (phaseStep !== -1) {
      setCurrentStep(phaseStep);
    }
  };

  const unlockAchievement = (achievement: string) => {
    if (!achievements.includes(achievement)) {
      setAchievements(prev => [...prev, achievement]);
    }
  };

  return (
    <EnhancedTourContext.Provider
      value={{
        isActive,
        currentStep,
        currentPhase,
        steps,
        achievements,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        goToStep,
        goToPhase,
        hasCompletedTour,
        unlockAchievement,
        tourProgress,
      }}
    >
      {children}
    </EnhancedTourContext.Provider>
  );
};
