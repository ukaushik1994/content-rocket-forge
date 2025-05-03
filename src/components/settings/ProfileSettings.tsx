
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

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
      await updateProfile({
        firstName,
        lastName,
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your user profile and personal information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                    <span className="text-2xl font-medium">
                      {firstName && lastName 
                        ? `${firstName[0]}${lastName[0]}` 
                        : email 
                          ? email[0].toUpperCase() 
                          : 'U'}
                    </span>
                  </div>
                  <Button type="button" variant="outline" size="sm">
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
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current password</Label>
            <Input id="current_password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <Input id="new_password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input id="confirm_password" type="password" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit"
            onClick={() => toast.info('Password change functionality will be implemented soon!')}
          >
            Change Password
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
