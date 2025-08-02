import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/Icons';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const { mode } = router.query;
  const isSignIn = mode === 'signin';
  const title = isSignIn ? 'Sign In' : 'Sign Up';
  const description = isSignIn ? 'Enter your email and password to sign in' : 'Create an account to continue';
  const buttonText = isSignIn ? 'Sign In' : 'Sign Up';
  const redirectTo = router.query.redirectTo as string;

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        router.push(redirectTo || '/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      // In the handleSignUp function, remove the extra parameter
      const result = await signUp(email, password, redirectTo);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        router.push('/auth/check-email');
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
      <Link
        href="/examples/authentication"
        className={cn(
          'absolute left-4 top-4 md:left-8 md:top-8',
          isSignIn ? 'lg:block' : 'lg:hidden'
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back to demo
        </>
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-foreground lg:flex">
        <div className="absolute inset-0 bg-[url(/auth-background.png)] dark:bg-[url(/auth-background-dark.png)] opacity-30" />
        <div className="my-auto">
          <Icons.logo className="h-6 text-primary" />
          <blockquote className="mt-6 space-y-2">
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
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button disabled={isLoading} onClick={handleSubmit}>
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  buttonText
                )}
              </Button>
              <Separator />
              <div className="text-center text-sm">
                {isSignIn ? (
                  <>
                    Don't have an account?{' '}
                    <Link href="/auth?mode=signup" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Link href="/auth?mode=signin" className="underline underline-offset-4">
                      Sign in
                    </Link>
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
