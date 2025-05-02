
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export function ProfileSettings() {
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile settings saved successfully!');
  };

  return (
    <Card className="glass-panel bg-glass">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your account settings and personal information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveProfile}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" className="bg-glass border-border" defaultValue="Content Creator" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Your email" className="bg-glass border-border" defaultValue="creator@example.com" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Your company" className="bg-glass border-border" defaultValue="ContentRocketForge" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="Your role" className="bg-glass border-border" defaultValue="Content Manager" />
            </div>
            
            <Button type="submit" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
              Save Profile Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
