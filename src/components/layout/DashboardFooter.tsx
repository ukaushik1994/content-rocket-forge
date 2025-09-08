import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Linkedin, Mail, Globe, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
export const DashboardFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const footerVariants = {
    hidden: {
      opacity: 0,
      y: 50
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  const linkVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };
  const socialLinks = [{
    icon: Github,
    href: "#",
    label: "GitHub"
  }, {
    icon: Twitter,
    href: "#",
    label: "Twitter"
  }, {
    icon: Linkedin,
    href: "#",
    label: "LinkedIn"
  }, {
    icon: Mail,
    href: "#",
    label: "Email"
  }];
  const footerLinks = [{
    title: "Product",
    links: [{
      name: "Content Builder",
      href: "/content-builder"
    }, {
      name: "Glossary Builder",
      href: "/glossary-builder"
    }, {
      name: "Analytics",
      href: "/analytics"
    }, {
      name: "API",
      href: "/api"
    }]
  }, {
    title: "Resources",
    links: [{
      name: "Documentation",
      href: "/docs"
    }, {
      name: "Tutorials",
      href: "/tutorials"
    }, {
      name: "Blog",
      href: "/blog"
    }, {
      name: "Community",
      href: "/community"
    }]
  }, {
    title: "Company",
    links: [{
      name: "About",
      href: "/about"
    }, {
      name: "Careers",
      href: "/careers"
    }, {
      name: "Contact",
      href: "/contact"
    }, {
      name: "Privacy",
      href: "/privacy"
    }]
  }];
  return <motion.footer className="relative mt-32 bg-gradient-to-b from-transparent to-slate-950/50 border-t border-white/10" initial="hidden" whileInView="visible" viewport={{
    once: true
  }} variants={footerVariants}>
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-neon-purple/10 to-transparent blur-3xl" animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3]
      }} transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        <motion.div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-gradient-to-l from-neon-blue/10 to-transparent blur-3xl" animate={{
        scale: [1, 0.8, 1],
        opacity: [0.4, 0.7, 0.4]
      }} transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>Made with</span>
              <motion.div animate={{
              scale: [1, 1.2, 1]
            }} transition={{
              duration: 1,
              repeat: Infinity
            }}>
                <Heart className="h-4 w-4 text-red-400 fill-current" />
              </motion.div>
              <span>by U. </span>
            </div>
            
            <div className="flex items-center gap-6">
              <p className="text-white/60 text-sm">© 2026 Content Pro. All rights reserved.</p>
              
              <Button onClick={scrollToTop} variant="ghost" size="sm" className="h-10 w-10 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/10 p-0">
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>;
};