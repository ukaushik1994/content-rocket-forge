import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { RocketLogo } from '@/components/auth/RocketLogo';
import { EnhancedAuthForm } from '@/components/auth/EnhancedAuthForm';
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    signIn,
    signUp
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode') || 'signin';
  const redirectTo = searchParams.get('redirectTo');
  const isSignIn = mode === 'signin';
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Welcome back! 🚀');
        navigate(redirectTo || '/');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await signUp(email, password, redirectTo || undefined);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Check your email to confirm your account! 📧');
        navigate('/auth/check-email');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignIn) {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };
  const toggleMode = () => {
    const newMode = isSignIn ? 'signup' : 'signin';
    navigate(`/auth?mode=${newMode}`);
    // Clear form when switching modes
    setEmail('');
    setPassword('');
  };
  return <div className="min-h-screen relative flex items-center justify-center p-4">
      <AnimatedBackground />
      
      {/* Back button */}
      

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glass morphism container */}
        <motion.div className="glass-panel rounded-3xl p-8 shadow-2xl" initial={{
        opacity: 0,
        scale: 0.9,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        ease: "easeOut"
      }}>
          <RocketLogo />
          
          <EnhancedAuthForm isSignIn={isSignIn} email={email} password={password} isLoading={isLoading} onEmailChange={setEmail} onPasswordChange={setPassword} onSubmit={handleSubmit} onToggleMode={toggleMode} />
        </motion.div>

        {/* Bottom decoration */}
        <motion.div className="text-center mt-8 text-xs text-muted-foreground/60" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.6,
        delay: 1
      }}>
          <p>Powered by AI • build by U for creators</p>
        </motion.div>
      </div>
    </div>;
};
export default Auth;