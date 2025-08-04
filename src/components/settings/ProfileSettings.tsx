import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [email, setEmail] = useState('');

  // Set initial values from user metadata
  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.first_name || '');
      setLastName(user.user_metadata?.last_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Create display name from first and last name
      const displayName = `${firstName} ${lastName}`.trim();
      
      await updateProfile({
        display_name: displayName,
        first_name: firstName,
        last_name: lastName,
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-panel bg-glass border border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-neon-purple/20 p-2">
                <User className="h-5 w-5 text-neon-purple" />
              </div>
              <div>
                <CardTitle className="text-gradient">Profile Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your user profile and personal information.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="relative z-10 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground font-medium">First name</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-background/50 border-white/20 backdrop-blur-sm focus:border-neon-purple/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground font-medium">Last name</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-background/50 border-white/20 backdrop-blur-sm focus:border-neon-purple/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    disabled 
                    className="bg-background/30 border-white/10 backdrop-blur-sm text-muted-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center overflow-hidden border-2 border-white/10 backdrop-blur-sm">
                      <span className="text-2xl font-medium text-gradient">
                        {firstName && lastName 
                          ? `${firstName[0]}${lastName[0]}` 
                          : email 
                            ? email[0].toUpperCase() 
                            : 'U'}
                      </span>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="bg-background/50 border-white/20 backdrop-blur-sm hover:bg-neon-purple/10 hover:border-neon-purple/30"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommended: Square image, at least 300×300px.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              >
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="glass-panel bg-glass border border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-gradient">Password Security</CardTitle>
            <CardDescription className="text-muted-foreground">
              Change your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password" className="text-foreground font-medium">Current password</Label>
              <Input 
                id="current_password" 
                type="password" 
                className="bg-background/50 border-white/20 backdrop-blur-sm focus:border-neon-purple/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-foreground font-medium">New password</Label>
              <Input 
                id="new_password" 
                type="password" 
                className="bg-background/50 border-white/20 backdrop-blur-sm focus:border-neon-purple/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-foreground font-medium">Confirm password</Label>
              <Input 
                id="confirm_password" 
                type="password" 
                className="bg-background/50 border-white/20 backdrop-blur-sm focus:border-neon-purple/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              type="submit"
              variant="outline"
              className="bg-background/50 border-white/20 backdrop-blur-sm hover:bg-neon-purple/10 hover:border-neon-purple/30"
              onClick={() => toast.info('Password change functionality will be implemented soon!')}
            >
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
