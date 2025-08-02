
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode') || 'signin';
  const redirectTo = searchParams.get('redirectTo');
  
  const isSignIn = mode === 'signin';
  const title = isSignIn ? 'Sign In' : 'Sign Up';
  const description = isSignIn ? 'Enter your email and password to sign in' : 'Create an account to continue';
  const buttonText = isSignIn ? 'Sign In' : 'Sign Up';

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        toast.error(result.error.message);
      } else {
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

  return (
    <div className="container relative flex h-[calc(100vh-80px)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <button
        onClick={() => navigate('/')}
        className={cn(
          'absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm hover:underline',
          isSignIn ? 'lg:block' : 'lg:hidden'
        )}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to home
      </button>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-foreground lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="mr-2 h-6 w-6 rounded bg-primary" />
          ContentRevolver
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Empower your content creation with AI-driven insights and seamless workflows.&rdquo;
            </p>
            <footer className="text-sm">ContentRevolver</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Input
                    id="email"
                    placeholder="Email"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    buttonText
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Separator />
              <div className="text-center text-sm">
                {isSignIn ? (
                  <>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => navigate('/auth?mode=signup')}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button 
                      onClick={() => navigate('/auth?mode=signin')}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
