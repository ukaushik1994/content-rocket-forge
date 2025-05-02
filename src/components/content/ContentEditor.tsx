
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  LayoutTemplate, 
  FileText, 
  Eye, 
  Settings, 
  Play, 
  Pencil, 
  Plus, 
  Info,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

export function ContentEditor() {
  const [editorContent, setEditorContent] = useState('# Best Project Management Software for Remote Teams in 2024\n\nRemote work is here to stay, but managing dispersed teams comes with unique challenges. According to recent studies, 67% of remote teams struggle with task visibility and coordination.\n\n## Top Project Management Tools for 2024\n\n### 1. TaskMaster Pro\n- **Key Features:** Gantt charts, AI analytics, real-time collaboration\n- **Best For:** Enterprise teams with complex workflows\n- **Pricing:** Starts at $29/mo per user');

  const [seoScore, setSeoScore] = useState(78);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
    
    // Simulate SEO score changing based on content length
    const newScore = Math.min(100, Math.max(0, 
      50 + (e.target.value.length / 100) + Math.random() * 10
    ));
    setSeoScore(Math.floor(newScore));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Content Editor</h2>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-glass p-2 rounded-lg">
                  <span>SEO Score:</span>
                  <Progress 
                    value={seoScore} 
                    className="w-32 h-2" 
                    indicatorClassName={`${seoScore > 70 ? 'bg-green-500' : seoScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  />
                  <Badge className={`${seoScore > 70 ? 'bg-green-500' : seoScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    {seoScore}/100
                  </Badge>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your content's overall optimization score</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
            <Play className="mr-2 h-4 w-4" />
            Generate Content
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="glass-panel flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue="edit" className="flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="edit" className="flex items-center gap-1">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <FileText className="mr-2 h-3 w-3" />
                    Save Draft
                  </Button>
                </div>
              </div>
              
              <TabsContent value="edit" className="flex-1 flex flex-col p-0 m-0">
                <Textarea
                  className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 bg-transparent"
                  value={editorContent}
                  onChange={handleContentChange}
                  placeholder="Start writing or use the generator..."
                />
              </TabsContent>
              
              <TabsContent value="preview" className="p-8 m-0 h-full overflow-auto">
                <div className="prose prose-invert max-w-none">
                  <h1 className="text-3xl font-bold mb-4">Best Project Management Software for Remote Teams in 2024</h1>
                  <p className="mb-4">Remote work is here to stay, but managing dispersed teams comes with unique challenges. According to recent studies, 67% of remote teams struggle with task visibility and coordination.</p>
                  <h2 className="text-2xl font-bold mb-3">Top Project Management Tools for 2024</h2>
                  <h3 className="text-xl font-bold mb-2">1. TaskMaster Pro</h3>
                  <ul className="list-disc ml-6 mb-4">
                    <li><strong>Key Features:</strong> Gantt charts, AI analytics, real-time collaboration</li>
                    <li><strong>Best For:</strong> Enterprise teams with complex workflows</li>
                    <li><strong>Pricing:</strong> Starts at $29/mo per user</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="p-4 m-0 h-full overflow-auto">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">SEO Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Meta Title</label>
                      <input 
                        type="text" 
                        className="w-full bg-glass border border-white/10 p-2 rounded-md" 
                        placeholder="Enter meta title"
                        defaultValue="Top 10 Project Management Tools – 2024 Expert Picks"
                      />
                      <p className="text-xs text-muted-foreground">60 characters maximum</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL Slug</label>
                      <input 
                        type="text" 
                        className="w-full bg-glass border border-white/10 p-2 rounded-md" 
                        placeholder="Enter URL slug"
                        defaultValue="best-project-management-software-2024"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card className="glass-panel">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Content Structure</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {[
                  { title: 'Introduction', complete: true },
                  { title: 'Top 10 Tools', complete: true },
                  { title: 'Features Comparison', complete: false },
                  { title: 'Use Case Examples', complete: false },
                  { title: 'Pricing Analysis', complete: false },
                  { title: 'FAQ Section', complete: false },
                  { title: 'Conclusion', complete: false },
                ].map((section, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-md border ${section.complete ? 'border-primary/30 bg-primary/5' : 'border-white/10'}`}
                  >
                    <span className="text-sm">{section.title}</span>
                    {section.complete && (
                      <Badge className="bg-primary/20 text-primary">Complete</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-panel">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Keyword Optimization</h3>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Primary Keyword</span>
                  <Badge className="bg-green-500/20 text-green-500">
                    Optimized
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Secondary Keywords</span>
                  <Badge className="bg-yellow-500/20 text-yellow-500">
                    3/5 Used
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Keyword Density</span>
                  <Badge className="bg-green-500/20 text-green-500">
                    1.2% (Good)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-panel">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Readability</h3>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reading Level</span>
                    <span className="text-sm font-medium">Grade 8</span>
                  </div>
                  <Progress value={75} className="h-1" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sentence Length</span>
                    <span className="text-sm font-medium">Good</span>
                  </div>
                  <Progress value={90} className="h-1" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paragraph Length</span>
                    <span className="text-sm font-medium">Excellent</span>
                  </div>
                  <Progress value={95} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
