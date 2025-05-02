
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { APISettings } from '@/components/settings/APISettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard,
  Key, 
  User, 
  Bell, 
  Palette,
  Download,
  Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile settings saved successfully!');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Notification preferences saved!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 space-y-6">
              <Tabs defaultValue="profile" orientation="vertical" className="w-full">
                <TabsList className="bg-secondary/30 flex flex-col h-auto space-y-1 rounded-xl p-2">
                  <TabsTrigger value="profile" className="justify-start gap-2 px-3">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="api" className="justify-start gap-2 px-3">
                    <Key className="h-4 w-4" />
                    API Settings
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start gap-2 px-3">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="justify-start gap-2 px-3">
                    <Palette className="h-4 w-4" />
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger value="export" className="justify-start gap-2 px-3">
                    <Download className="h-4 w-4" />
                    Export Data
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="justify-start gap-2 px-3">
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="justify-start gap-2 px-3">
                    <SettingsIcon className="h-4 w-4" />
                    Advanced
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1 space-y-6">
              <Tabs defaultValue="profile">
                <TabsContent value="profile" className="space-y-6">
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
                </TabsContent>
                
                <TabsContent value="api">
                  <APISettings />
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-6">
                  <Card className="glass-panel bg-glass">
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Configure how you want to receive notifications.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveNotifications}>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Email Notifications</h3>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="email-content-published">Content Published</Label>
                                <p className="text-xs text-muted-foreground">
                                  Receive an email when your content is published.
                                </p>
                              </div>
                              <Switch id="email-content-published" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="email-ranking-changes">Ranking Changes</Label>
                                <p className="text-xs text-muted-foreground">
                                  Receive an email when your content changes position.
                                </p>
                              </div>
                              <Switch id="email-ranking-changes" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="email-marketing">Marketing Updates</Label>
                                <p className="text-xs text-muted-foreground">
                                  Receive marketing and product updates.
                                </p>
                              </div>
                              <Switch id="email-marketing" />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">In-App Notifications</h3>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="app-comments">Comments</Label>
                                <p className="text-xs text-muted-foreground">
                                  Show notifications for new comments on your content.
                                </p>
                              </div>
                              <Switch id="app-comments" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="app-mentions">Mentions</Label>
                                <p className="text-xs text-muted-foreground">
                                  Show notifications when you're mentioned.
                                </p>
                              </div>
                              <Switch id="app-mentions" defaultChecked />
                            </div>
                          </div>
                          
                          <Button type="submit" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
                            Save Notification Settings
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-6">
                  <Card className="glass-panel bg-glass">
                    <CardHeader>
                      <CardTitle>Appearance Settings</CardTitle>
                      <CardDescription>
                        Customize the look and feel of your dashboard.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Theme</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2 ring-2 ring-primary ring-offset-2 ring-offset-background">
                              <div className="w-full h-20 rounded bg-gradient-to-br from-neon-purple to-neon-blue"></div>
                              <span className="text-xs">Neon</span>
                            </div>
                            <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2">
                              <div className="w-full h-20 rounded bg-gradient-to-br from-orange-500 to-amber-500"></div>
                              <span className="text-xs">Amber</span>
                            </div>
                            <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2">
                              <div className="w-full h-20 rounded bg-gradient-to-br from-emerald-500 to-teal-500"></div>
                              <span className="text-xs">Emerald</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Dashboard Layout</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2 ring-2 ring-primary ring-offset-2 ring-offset-background">
                              <div className="w-full h-20 rounded bg-background/50 flex items-center justify-center">
                                <div className="grid grid-cols-3 gap-1 w-4/5 h-4/5">
                                  <div className="bg-primary/30 rounded"></div>
                                  <div className="bg-primary/30 rounded"></div>
                                  <div className="bg-primary/30 rounded"></div>
                                </div>
                              </div>
                              <span className="text-xs">Grid</span>
                            </div>
                            <div className="border border-border rounded-lg p-3 bg-background/30 cursor-pointer flex flex-col items-center space-y-2">
                              <div className="w-full h-20 rounded bg-background/50 flex items-center justify-center">
                                <div className="flex flex-col gap-1 w-4/5 h-4/5">
                                  <div className="bg-primary/30 rounded h-1/3"></div>
                                  <div className="bg-primary/30 rounded h-1/3"></div>
                                  <div className="bg-primary/30 rounded h-1/3"></div>
                                </div>
                              </div>
                              <span className="text-xs">List</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button type="submit" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
                          Save Appearance Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="export" className="space-y-6">
                  <Card className="glass-panel bg-glass">
                    <CardHeader>
                      <CardTitle>Export Data</CardTitle>
                      <CardDescription>
                        Export your content and analytics data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-background/50">
                            <CardContent className="pt-6">
                              <h3 className="text-lg font-medium mb-2">Content Export</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Export all your content in various formats for backup or migration.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline">Export as JSON</Button>
                                <Button size="sm" variant="outline">Export as CSV</Button>
                                <Button size="sm" variant="outline">Export as PDF</Button>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-background/50">
                            <CardContent className="pt-6">
                              <h3 className="text-lg font-medium mb-2">Analytics Export</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Export your analytics data for further analysis.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline">Export as Excel</Button>
                                <Button size="sm" variant="outline">Export as CSV</Button>
                                <Button size="sm" variant="outline">Export as JSON</Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="rounded-lg border border-border p-4 bg-background/30">
                          <h3 className="text-sm font-medium mb-2">Full Account Data</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Export all your account data including content, analytics, settings, and history.
                          </p>
                          <Button variant="outline">Request Full Data Export</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="billing" className="space-y-6">
                  <Card className="glass-panel bg-glass">
                    <CardHeader>
                      <CardTitle>Billing Information</CardTitle>
                      <CardDescription>
                        Manage your subscription and payment methods.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="rounded-lg border border-border p-4 bg-green-500/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">Pro Plan</h3>
                              <p className="text-sm text-muted-foreground">$49/month, billed monthly</p>
                            </div>
                            <Badge className="bg-green-500">Active</Badge>
                          </div>
                          <div className="mt-4 space-y-1">
                            <div className="flex items-center">
                              <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Unlimited content generation</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Advanced SEO tools</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm">Detailed analytics</span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Button variant="outline">Change Plan</Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Payment Methods</h3>
                          <div className="rounded-lg border border-border p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-10 w-14 rounded bg-background mr-3 flex items-center justify-center">
                                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 9H2M22 12H2M22 15H2M6 18H2M22 5H2V19H22V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="font-medium">Visa ending in 1234</div>
                                  <div className="text-sm text-muted-foreground">Expires 04/26</div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </div>
                          </div>
                          
                          <Button variant="outline">Add Payment Method</Button>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Billing History</h3>
                          <div className="rounded-md border">
                            <div className="relative w-full overflow-auto">
                              <table className="w-full caption-bottom text-sm">
                                <thead>
                                  <tr className="border-b bg-muted/50">
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Receipt</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b bg-background/50">
                                    <td className="p-4 align-middle">Apr 1, 2025</td>
                                    <td className="p-4 align-middle">$49.00</td>
                                    <td className="p-4 align-middle">
                                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500">
                                        Paid
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                      <Button variant="ghost" size="sm">View</Button>
                                    </td>
                                  </tr>
                                  <tr className="border-b bg-background/50">
                                    <td className="p-4 align-middle">Mar 1, 2025</td>
                                    <td className="p-4 align-middle">$49.00</td>
                                    <td className="p-4 align-middle">
                                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500">
                                        Paid
                                      </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                      <Button variant="ghost" size="sm">View</Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ children, className }: BadgeProps) => {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", 
      className
    )}>
      {children}
    </span>
  );
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
