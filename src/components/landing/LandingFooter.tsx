import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';
import { Mail, ArrowRight, Sparkles, Heart } from 'lucide-react';
export const LandingFooter = () => {
  const navigate = useNavigate();
  const socialLinks = [{
    icon: Mail,
    href: 'mailto:hello@creaiter.com',
    label: 'Email'
  }];
  return <footer className="relative py-20 px-4 border-t border-border/50">
      <Container>
        {/* Main Footer Content */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} viewport={{
          once: true
        }}>
              <CreAiterLogo showText className="mb-6 mx-auto" />
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Empowering creators worldwide with self-learning AI that gets smarter with every post. 
                Transform your content strategy with an engine that learns from YOUR results and YOUR audience.
              </p>
              
              <Button onClick={() => navigate('/auth?mode=signup')} className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 neon-glow">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Creating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
        </div>

        {/* Newsletter Signup */}
        


























        {/* Bottom Bar */}
        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} transition={{
        duration: 0.8,
        delay: 0.6
      }} viewport={{
        once: true
      }} className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-4 md:mb-0">
            <span>© 2026 Creaiter. Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for creators worldwide.</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => <motion.a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" initial={{
            opacity: 0,
            scale: 0.8
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} viewport={{
            once: true
          }} className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-neon-blue/20 border border-primary/30 flex items-center justify-center hover:from-primary/30 hover:to-neon-blue/30 hover:shadow-neon transition-all duration-300" aria-label={social.label}>
                <social.icon className="h-4 w-4 text-primary" />
              </motion.a>)}
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-neon-blue rounded-full animate-pulse opacity-80" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute top-1/2 right-10 w-1.5 h-1.5 bg-neon-pink rounded-full animate-pulse opacity-70" style={{
        animationDelay: '2s'
      }}></div>
      </Container>
    </footer>;
};