
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Edit3, Copy, Users, Rocket, Award, Calendar, Lightbulb, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const ContentTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  const templates = {
    hiring: [
      {
        id: 1,
        title: "General Hiring Post",
        category: "Hiring",
        template: "We're growing! 🚀 [Company] is hiring a [Role] in our [Team]. If you're passionate about [key trait] and want to work with a team that [fun fact about team culture], check out the link! 👉 [Jobs Page] #Hiring #LifeAt[Company]",
        placeholder: "Add why you're excited about this hire or what the team is like...",
        points: 15,
        platforms: ["LinkedIn", "Twitter"]
      },
      {
        id: 2,
        title: "Specific Role Highlight",
        category: "Hiring",
        template: "Looking for a [Role] who gets excited about [specific skill/passion]? 💡 We've got the perfect opportunity! Our team is [team characteristic] and we'd love someone who [desired quality]. Apply here: [Link] #Hiring #TeamGrowth",
        placeholder: "Share what makes this role special to you...",
        points: 15,
        platforms: ["LinkedIn", "Twitter"]
      }
    ],
    product: [
      {
        id: 3,
        title: "Product Launch",
        category: "Product",
        template: "Big news: [Product Name] just launched! 🎉 I'm so proud of our team – [Product Name] will help [customer benefit]. Check it out here: [Link]. #NewProduct #Innovation",
        placeholder: "Share your role in the project or what excites you most...",
        points: 25,
        platforms: ["LinkedIn", "Twitter", "Facebook"]
      },
      {
        id: 4,
        title: "Feature Update",
        category: "Product",
        template: "Just dropped: [Feature Name] is now live! ✨ This one's been in the works for [timeframe] and I'm excited to see how it helps our users [benefit]. Try it out: [Link] #ProductUpdate #UserExperience",
        placeholder: "Add a personal note about the development process...",
        points: 20,
        platforms: ["LinkedIn", "Twitter"]
      }
    ],
    culture: [
      {
        id: 5,
        title: "Team Event",
        category: "Culture",
        template: "Ever wonder what #LifeAt[Company] is like? Here's a peek: [Description of event]. 💗 Love that we [culture highlight]. #CompanyCulture #Team",
        placeholder: "Add a fun anecdote or your personal feelings about the event...",
        points: 15,
        platforms: ["LinkedIn", "Instagram", "Twitter"]
      },
      {
        id: 6,
        title: "Values in Action",
        category: "Culture",
        template: "Proud moment: our team just [action that demonstrates company values]. This is exactly what [Company Value] looks like in practice! 🌟 #CompanyValues #TeamWork",
        placeholder: "Share how this reflects your personal experience...",
        points: 18,
        platforms: ["LinkedIn", "Twitter"]
      }
    ],
    thought: [
      {
        id: 7,
        title: "Industry Insight",
        category: "Thought Leadership",
        template: "New blog post alert! 📝 [Leader or Team] at [Company] shares insights on [Hot Industry Topic]. As someone in the field, I found the take on [specific point] really interesting. Worth a read for anyone into [field]! #ThoughtLeadership #Learning",
        placeholder: "Mention what you learned or pose a question to your network...",
        points: 22,
        platforms: ["LinkedIn", "Twitter"]
      }
    ],
    wins: [
      {
        id: 8,
        title: "Team Achievement",
        category: "Team Wins",
        template: "Celebrating a win for our [Department] team! 🏆 We just [achievement]. Huge congrats to everyone who worked so hard for this – teamwork FTW! #Proud #TeamWins",
        placeholder: "Tag teammates or express what the win means to you...",
        points: 20,
        platforms: ["LinkedIn", "Twitter", "Slack"]
      }
    ]
  };

  const categoryIcons = {
    "Hiring": Users,
    "Product": Rocket,
    "Culture": Award,
    "Thought Leadership": Lightbulb,
    "Team Wins": Briefcase
  };

  const allTemplates = Object.values(templates).flat();

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomMessage(template.template);
  };

  const handleShare = (platform) => {
    toast.success(`Shared to ${platform}! +${selectedTemplate.points} points earned 🎉`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    toast.success("Template copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-white/10 backdrop-blur-md">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="hiring">Hiring</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="culture">Culture</TabsTrigger>
              <TabsTrigger value="thought">Thought Leadership</TabsTrigger>
              <TabsTrigger value="wins">Team Wins</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {allTemplates.map((template, index) => {
                const Icon = categoryIcons[template.category] || Rocket;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`bg-white/10 backdrop-blur-md border-white/20 cursor-pointer transition-all hover:bg-white/15 ${
                        selectedTemplate?.id === template.id ? 'border-neon-purple' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-neon-purple" />
                            <h3 className="font-semibold text-white">{template.title}</h3>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">
                            +{template.points} pts
                          </Badge>
                        </div>
                        <Badge variant="outline" className="mb-2">{template.category}</Badge>
                        <p className="text-sm text-white/70 line-clamp-2">{template.template}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.platforms.map((platform) => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </TabsContent>

            {Object.entries(templates).map(([key, categoryTemplates]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                {categoryTemplates.map((template, index) => {
                  const Icon = categoryIcons[template.category] || Rocket;
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className={`bg-white/10 backdrop-blur-md border-white/20 cursor-pointer transition-all hover:bg-white/15 ${
                          selectedTemplate?.id === template.id ? 'border-neon-purple' : ''
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-neon-purple" />
                              <h3 className="font-semibold text-white">{template.title}</h3>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400">
                              +{template.points} pts
                            </Badge>
                          </div>
                          <p className="text-sm text-white/70">{template.template}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.platforms.map((platform) => (
                              <Badge key={platform} variant="secondary" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Template Editor */}
        <div>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 sticky top-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Customize & Share
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplate ? (
                <>
                  <div>
                    <label className="text-sm text-white/70 block mb-2">Your Post</label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="bg-white/5 border-white/20 text-white min-h-[120px]"
                      placeholder="Customize your message..."
                    />
                  </div>
                  
                  <div className="text-sm text-white/60 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    💡 Tip: {selectedTemplate.placeholder}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Share to:</label>
                    {selectedTemplate.platforms.map((platform) => (
                      <Button
                        key={platform}
                        className="w-full bg-gradient-to-r from-neon-purple to-neon-blue"
                        onClick={() => handleShare(platform)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share to {platform}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Select a template to start customizing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
