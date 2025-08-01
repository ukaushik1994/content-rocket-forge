
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import { useTour } from '@/contexts/TourContext';

export const AppTour: React.FC = () => {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    prevStep,
    skipTour,
    goToStep,
  } = useTour();

  const overlayRef = useRef<HTMLDivElement>(null);
  
  const currentTourStep = steps[currentStep];
  
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isActive]);

  const getElementPosition = (selector: string) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    };
  };

  const getDialogPosition = () => {
    if (!currentTourStep.selector || currentTourStep.position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
      };
    }

    const elementPos = getElementPosition(currentTourStep.selector);
    if (!elementPos) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
      };
    }

    const dialogWidth = 400;
    const dialogHeight = 300;
    const offset = 20;

    let style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 60,
    };

    switch (currentTourStep.position) {
      case 'top':
        style.top = elementPos.top - dialogHeight - offset;
        style.left = elementPos.left + elementPos.width / 2 - dialogWidth / 2;
        break;
      case 'bottom':
        style.top = elementPos.top + elementPos.height + offset;
        style.left = elementPos.left + elementPos.width / 2 - dialogWidth / 2;
        break;
      case 'left':
        style.top = elementPos.top + elementPos.height / 2 - dialogHeight / 2;
        style.left = elementPos.left - dialogWidth - offset;
        break;
      case 'right':
        style.top = elementPos.top + elementPos.height / 2 - dialogHeight / 2;
        style.left = elementPos.left + elementPos.width + offset;
        break;
      default:
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%)';
    }

    return style;
  };

  const renderSpotlight = () => {
    if (!currentTourStep.selector) return null;
    
    const elementPos = getElementPosition(currentTourStep.selector);
    if (!elementPos) return null;

    return (
      <motion.div
        className="absolute rounded-lg border-2 border-neon-blue shadow-lg shadow-neon-blue/50 pointer-events-none"
        style={{
          top: elementPos.top - 8,
          left: elementPos.left - 8,
          width: elementPos.width + 16,
          height: elementPos.height + 16,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: [
            "0 0 0 0 rgba(51, 195, 240, 0.4)",
            "0 0 0 20px rgba(51, 195, 240, 0.1)",
            "0 0 0 0 rgba(51, 195, 240, 0.4)"
          ]
        }}
        transition={{ 
          duration: 0.5,
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />
    );
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderSpotlight()}
        
        <motion.div
          className="w-[400px] max-w-[90vw] bg-background/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
          style={getDialogPosition()}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={skipTour}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-neon-blue" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mt-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {currentTourStep.title}
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <div className="text-sm text-muted-foreground leading-relaxed">
              {currentTourStep.description}
            </div>
          </div>

          {/* Progress indicators */}
          <div className="px-6 pb-4">
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <motion.button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-neon-purple to-neon-blue w-8'
                      : index < currentStep
                      ? 'bg-neon-blue/50 w-2'
                      : 'bg-white/20 w-2'
                  }`}
                  onClick={() => goToStep(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 pt-0 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip Tour
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="border-white/20 hover:border-white/40"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                size="sm"
                onClick={nextStep}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white"
              >
                {currentStep === steps.length - 1 ? (
                  'Complete Tour'
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
