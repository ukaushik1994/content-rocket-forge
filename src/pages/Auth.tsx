import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error: any) {
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signUp(email, password, firstName, lastName);
      toast.success('Account created! Please check your email to verify your account.');
    } catch (error: any) {
      toast.error(`Signup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setIsLoading(true);
    toast.success('Accessing demo environment!');
    // Simulate a brief loading period then navigate directly
    setTimeout(() => {
      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-slate-950">
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>
      
      <div className="w-full max-w-md z-10 p-4">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="h-12 w-12 rounded-full bg-neon-blue opacity-40 blur-md absolute"></div>
            <div className="h-10 w-10 rounded-full bg-glass flex items-center justify-center border border-neon-blue relative">
              <span className="text-xl font-bold text-white">CR</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">ContentRocketForge</h1>
          <p className="mt-2 text-muted-foreground">Power your content with AI-driven insights</p>
        </div>

        <Card className="glass-panel">
          <Tabs defaultValue="login">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-glass border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 font-normal text-xs"
                        onClick={() => toast.info("Reset functionality will be implemented soon!")}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-glass border-white/10"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-glass border-white/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-glass border-white/10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input 
                      id="signupEmail" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-glass border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <Input 
                      id="signupPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-glass border-white/10"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <div className="relative w-full mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleDemoAccess} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Demo Account
              </Button>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
