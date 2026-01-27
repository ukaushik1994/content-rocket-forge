
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedAuthFormProps {
  isSignIn: boolean;
  email: string;
  password: string;
  isLoading: boolean;
  isGoogleLoading?: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
  onGoogleSignIn: () => void;
}

// Google "G" logo SVG component
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 0, 0)">
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
      <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"/>
      <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98c-.8 1.58-1.27 3.38-1.27 5.38s.46 3.8 1.27 5.38l3.98-3.09z"/>
      <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42c-2.07-1.94-4.78-3.13-8.02-3.13-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
    </g>
  </svg>
);

export const EnhancedAuthForm = ({
  isSignIn,
  email,
  password,
  isLoading,
  isGoogleLoading = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  onGoogleSignIn,
}: EnhancedAuthFormProps) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const title = isSignIn ? 'Welcome Back' : 'Start Your Journey';
  const subtitle = isSignIn 
    ? 'Sign in to continue creating amazing content' 
    : 'Create your account and launch into content creation';
  const buttonText = isSignIn ? 'Launch Dashboard' : 'Create Account';

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2
          className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Form */}
      <motion.form
        onSubmit={onSubmit}
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              disabled={isLoading}
              className={cn(
                "pl-10 h-12 transition-all duration-300 border-border/40 focus-visible:ring-primary/50",
                focusedField === 'email' && "border-primary/60 shadow-lg shadow-primary/10"
              )}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              disabled={isLoading}
              className={cn(
                "pl-10 h-12 transition-all duration-300 border-border/40 focus-visible:ring-primary/50",
                focusedField === 'password' && "border-primary/60 shadow-lg shadow-primary/10"
              )}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full h-12 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-medium shadow-lg shadow-primary/25 transition-all duration-300"
          >
            {isLoading ? (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Launching...</span>
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Sparkles className="h-4 w-4" />
                <span>{buttonText}</span>
              </motion.div>
            )}
          </Button>
        </motion.div>
      </motion.form>

      {/* Divider */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or continue with</span>
          </div>
        </div>
      </motion.div>

      {/* Google Sign-In Button */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
          className="w-full h-12 bg-background hover:bg-muted/50 border-border/40 hover:border-border/60 font-medium shadow-sm transition-all duration-300"
        >
          {isGoogleLoading ? (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Connecting...</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <GoogleLogo />
              <span>Continue with Google</span>
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Toggle Mode */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="text-sm text-muted-foreground">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={onToggleMode}
            disabled={isLoading || isGoogleLoading}
            className="ml-2 font-medium text-primary hover:text-primary/80 transition-colors duration-200 underline underline-offset-4"
          >
            {isSignIn ? "Create account" : "Sign in"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
