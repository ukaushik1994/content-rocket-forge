import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { RocketLogo } from '@/components/auth/RocketLogo';

const CheckEmail = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <AnimatedBackground />
      
      {/* Back button */}
      <Link 
        to="/auth" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Login</span>
      </Link>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glass morphism container */}
        <motion.div 
          className="glass-panel rounded-3xl p-8 shadow-2xl text-center"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <RocketLogo />
          
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-white mb-3">
              Check Your Email
            </h1>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              We've sent you a confirmation link. Please check your email and click the link to verify your account.
            </p>
            
            <div className="text-xs text-white/60">
              <p>Didn't receive the email? Check your spam folder or</p>
              <Link to="/auth?mode=signup" className="text-primary hover:text-primary/80 transition-colors">
                try signing up again
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div 
          className="text-center mt-8 text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <p>Powered by AI • built by U for creators</p>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckEmail;