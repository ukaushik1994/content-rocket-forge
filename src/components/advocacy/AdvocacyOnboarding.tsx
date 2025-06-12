
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Megaphone, Share2, Trophy, Users, Zap, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvocacyOnboardingProps {
  onComplete: () => void;
}

export const AdvocacyOnboarding: React.FC<AdvocacyOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Employee Advocacy! 🚀",
      icon: Megaphone,
      content: (
        <div className="text-center space-y-4">
          <p className="text-lg text-white/90">
            Ready to amplify our company's voice while building your personal brand?
          </p>
          <p className="text-white/70">
            When you share company content, you help us reach <strong>5x more people</strong> than our official channels alone. 
            Plus, people trust content from people they know more than from brands! 📈
          </p>
          <div className="bg-neon-purple/10 border border-neon-purple/30 rounded-lg p-4">
            <p className="text-sm text-neon-purple">
              💡 <strong>Fun fact:</strong> Employee posts get 8x more engagement than company posts!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "What's In It for You? 💪",
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            Sharing isn't just helping the company – it's helping <strong>you</strong> too:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">🌟 Build Your Personal Brand</h4>
              <p className="text-sm text-white/70">
                Establish yourself as a thought leader in your network and industry.
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2">🤝 Grow Your Network</h4>
              <p className="text-sm text-white/70">
                Connect with industry professionals and potential collaborators.
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-300 mb-2">📈 Career Growth</h4>
              <p className="text-sm text-white/70">
                Demonstrate your knowledge and passion to advance your career.
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">🎯 Stay Informed</h4>
              <p className="text-sm text-white/70">
                Be the first to know about company news and industry trends.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How It Works 🛠️",
      icon: Share2,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-gradient-to-r from-neon-purple to-neon-blue rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Choose Content</h4>
              <p className="text-sm text-white/70">
                Browse pre-approved templates for hiring, product updates, culture posts, and more.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-neon-purple to-neon-blue rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Add Your Voice</h4>
              <p className="text-sm text-white/70">
                Customize with your personal perspective – authenticity beats copy-paste every time!
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-neon-purple to-neon-blue rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Share & Earn</h4>
              <p className="text-sm text-white/70">
                Post to your networks and earn points, badges, and recognition!
              </p>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-sm text-amber-300">
              ✨ <strong>Pro tip:</strong> Quality over quantity – one meaningful post is better than spam. 
              We recommend no more than one post per day on LinkedIn!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Gamification & Rewards 🏆",
      icon: Trophy,
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            Make sharing fun with our points system and achievements:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Earn Points For:</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Sharing posts (+10-25 points)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Getting engagement (+1-5 points per like/comment)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Personal customization (+5 bonus points)
                </li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Unlock Badges:</h4>
              <div className="space-y-2">
                <Badge className="bg-yellow-500/20 text-yellow-400">🏆 Brand Champion</Badge>
                <Badge className="bg-blue-500/20 text-blue-400">⭐ Social Star</Badge>
                <Badge className="bg-green-500/20 text-green-400">🎯 Content Creator</Badge>
              </div>
            </div>
          </div>
          <div className="text-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-sm text-white/80">
              🎉 Monthly leaderboards, team challenges, and special recognition await!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Brand Guidelines 📋",
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            Don't worry about staying on-brand – we've got your back! 🛡️
          </p>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-green-300 mb-2">✅ All Templates Are Pre-Approved</h4>
            <p className="text-sm text-white/70">
              Our brand team has reviewed every template to ensure consistency with our voice and values.
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">🎨 Maintain Our Voice</h4>
            <p className="text-sm text-white/70">
              Our tone is confident, slightly witty, and always authentic – just like you!
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-purple-300 mb-2">✍️ Your Personal Touch</h4>
            <p className="text-sm text-white/70">
              Add your perspective to make posts genuine while staying true to our brand.
            </p>
          </div>
          <p className="text-sm text-white/60 text-center">
            Remember: Authenticity beats perfection. Share what genuinely excites you!
          </p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-neon-purple to-neon-blue h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full mb-4">
                  <steps[currentStep].icon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {steps[currentStep].title}
                </h2>
              </div>

              <div className="min-h-[300px]">
                {steps[currentStep].content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-neon-purple to-neon-blue' 
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-neon-purple to-neon-blue flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
