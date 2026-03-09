import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Upload, User, Lock, ChevronDown, ChevronRight } from 'lucide-react';

export function ProfileSettingsTab() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [email, setEmail] = useState('');
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [securityExpanded, setSecurityExpanded] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  // Calculate profile completion
  const profileFields = [firstName, lastName, email].filter(Boolean);
  const profileCompletion = profileFields.length;
  const totalFields = 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium mb-2">Profile Settings</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your personal information, account security, and preferences.
        </p>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {profileCompletion} of {totalFields} fields completed
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalFields }).map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index < profileCompletion ? 'bg-foreground' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="ghost"
          className="w-full h-auto p-0 justify-start font-normal hover:bg-transparent"
          onClick={() => setProfileExpanded(!profileExpanded)}
        >
          <div className="flex items-center justify-between w-full py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {profileExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Profile Information</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {profileCompletion}/{totalFields}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalFields }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i < profileCompletion ? 'bg-foreground' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Button>
        
        {profileExpanded && (
          <div className="space-y-4 pl-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  disabled 
                  className="bg-muted text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Profile Picture</Label>
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border/20 bg-transparent hover:bg-muted/20 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center border border-border/20 shrink-0">
                    <span className="text-lg font-medium">
                      {firstName && lastName 
                        ? `${firstName[0]}${lastName[0]}` 
                        : email 
                          ? email[0].toUpperCase() 
                          : 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile Photo</p>
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image, at least 300×300px.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="mr-2 h-3 w-3" />
                    Upload
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  size="sm"
                >
                  {isUpdating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* Security Section */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="ghost"
          className="w-full h-auto p-0 justify-start font-normal hover:bg-transparent"
          onClick={() => setSecurityExpanded(!securityExpanded)}
        >
          <div className="flex items-center justify-between w-full py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {securityExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Lock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Password Security</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Secure
              </span>
            </div>
          </div>
        </Button>
        
        {securityExpanded && (
          <div className="space-y-4 pl-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password" className="text-sm font-medium">Current password</Label>
                <Input id="current_password" type="password" className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-sm font-medium">New password</Label>
                <Input id="new_password" type="password" className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm font-medium">Confirm password</Label>
                <Input id="confirm_password" type="password" className="text-sm" />
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Password change functionality will be implemented soon!')}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}