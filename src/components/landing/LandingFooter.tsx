import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';
import { Twitter, Github, Linkedin, Mail, ArrowRight, Sparkles, Heart } from 'lucide-react';
export const LandingFooter = () => {
  const navigate = useNavigate();
  const footerLinks = {
    product: [{
      name: 'Features',
      href: '#features'
    }, {
      name: 'Pricing',
      href: '#pricing'
    }, {
      name: 'API',
      href: '#api'
    }, {
      name: 'Integrations',
      href: '#integrations'
    }],
    company: [{
      name: 'About',
      href: '#about'
    }, {
      name: 'Blog',
      href: '#blog'
    }, {
      name: 'Careers',
      href: '#careers'
    }, {
      name: 'Press',
      href: '#press'
    }],
    resources: [{
      name: 'Documentation',
      href: '#docs'
    }, {
      name: 'Help Center',
      href: '#help'
    }, {
      name: 'Community',
      href: '#community'
    }, {
      name: 'Status',
      href: '#status'
    }],
    legal: [{
      name: 'Privacy',
      href: '#privacy'
    }, {
      name: 'Terms',
      href: '#terms'
    }, {
      name: 'Security',
      href: '#security'
    }, {
      name: 'Cookies',
      href: '#cookies'
    }]
  };
  const socialLinks = [{
    icon: Twitter,
    href: 'https://twitter.com/creaiter',
    label: 'Twitter'
  }, {
    icon: Github,
    href: 'https://github.com/creaiter',
    label: 'GitHub'
  }, {
    icon: Linkedin,
    href: 'https://linkedin.com/company/creaiter',
    label: 'LinkedIn'
  }, {
    icon: Mail,
    href: 'mailto:hello@creaiter.com',
    label: 'Email'
  }];
  return <footer className="relative py-20 px-4 border-t border-border/50">
      <Container>
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
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
              <CreAiterLogo showText className="mb-6" />
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Empowering creators worldwide with self-learning AI that gets smarter with every post. 
                Transform your content strategy with an engine that learns from YOUR results and YOUR audience.
              </p>
              
              {/* CTA */}
              <Button onClick={() => navigate('/auth?mode=signup')} className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 neon-glow">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Creating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], index) => <motion.div key={category} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: index * 0.1
        }} viewport={{
          once: true
        }}>
              <h3 className="font-semibold mb-4 capitalize">{category}</h3>
              <ul className="space-y-3">
                {links.map(link => <li key={link.name}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors duration-200">
                      {link.name}
                    </a>
                  </li>)}
              </ul>
            </motion.div>)}
        </div>

        {/* Newsletter Signup */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.4
      }} viewport={{
        once: true
      }} className="glass-card p-8 rounded-2xl mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Join 10,000+ Creators with Self-Learning AI</h3>
            <p className="text-muted-foreground mb-6">
              Get exclusive insights on how to train your AI engine for maximum content performance. 
              Tips on leveraging the learning loop to 10x your results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border/50 focus:border-primary focus:outline-none" />
              <Button className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90">
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>

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