import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { OpenRouterSettings } from '@/components/ai-chat/OpenRouterSettings';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Brain, Zap, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PageContainer } from '@/components/ui/PageContainer';

const AISettings = () => {
  const [activeSection, setActiveSection] = useState<'ai' | 'security'>('ai');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const sections = [
    { key: 'ai' as const, label: 'AI Settings', icon: Brain },
    { key: 'security' as const, label: 'Security', icon: Shield },
  ];

  return (
    <PageContainer className="flex flex-col">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <motion.div 
          className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-primary opacity-[0.02] blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.main 
        className="flex-1 pt-24 p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-border/50 mb-6"
            >
              <Settings className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-hero font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Configure your AI providers, security, and preferences.
            </p>
          </div>

          {/* Section Tabs */}
          <div className="flex justify-center">
            <div className="glass-card p-1 rounded-2xl flex">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`relative flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                    activeSection === s.key
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {activeSection === s.key && (
                    <motion.div
                      layoutId="settings-tab-indicator"
                      className="absolute inset-0 bg-primary rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <s.icon className="h-4 w-4" />
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Settings Section */}
          {activeSection === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6"
            >
              <OpenRouterSettings />

              <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 border border-border/50">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">AI Preferences</h3>
                    <p className="text-sm text-muted-foreground">Customize AI behavior and response style</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 ml-auto">Coming Soon</Badge>
                </div>
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Advanced AI customization options will be available soon</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6"
            >
              {/* Password Change */}
              <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 border border-border/50">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                </div>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                    />
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={changingPassword || !newPassword || !confirmPassword}
                    className="w-full"
                  >
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </Card>

              {/* Security Status */}
              <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 border border-border/50">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Security Status</h3>
                    <p className="text-sm text-muted-foreground">Your account security overview</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">API Key Encryption</p>
                      <p className="text-xs text-muted-foreground">Your API keys are encrypted at rest</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div>
                      <p className="text-sm font-medium text-foreground">Data Processing</p>
                      <p className="text-xs text-muted-foreground">Conversations are processed securely</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">Enabled</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.main>
    </PageContainer>
  );
};

export default AISettings;