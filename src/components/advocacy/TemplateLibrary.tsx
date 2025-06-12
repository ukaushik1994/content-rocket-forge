
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Clock, 
  Users,
  Rocket,
  Award,
  Lightbulb,
  Briefcase,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Template {
  id: number;
  title: string;
  category: string;
  template: string;
  variables: Array<{
    key: string;
    label: string;
    placeholder: string;
    value: string;
    type: 'text' | 'select' | 'number';
    options?: string[];
  }>;
  platforms: string[];
  points: number;
  tone: 'professional' | 'casual' | 'enthusiastic' | 'informative';
  hashtags: string[];
  mentions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  popularity: number;
  trending: boolean;
  featured: boolean;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'points' | 'recent'>('popularity');

  const templates: Template[] = [
    {
      id: 1,
      title: "Product Launch Announcement",
      category: "Product",
      template: "🚀 Exciting news! {product_name} just launched and I couldn't be more proud of our team's hard work. {product_description}\n\nWhat makes this special? {key_benefit}\n\nCheck it out: {link}",
      variables: [
        { key: 'product_name', label: 'Product Name', placeholder: 'Our New Feature', value: '', type: 'text' },
        { key: 'product_description', label: 'Product Description', placeholder: 'Brief description of the product', value: '', type: 'text' },
        { key: 'key_benefit', label: 'Key Benefit', placeholder: 'Main benefit for users', value: '', type: 'text' },
        { key: 'link', label: 'Link', placeholder: 'https://company.com/product', value: '', type: 'text' }
      ],
      platforms: ["LinkedIn", "Twitter", "Facebook"],
      points: 25,
      tone: 'enthusiastic',
      hashtags: ['ProductLaunch', 'Innovation', 'TeamWork'],
      mentions: [],
      difficulty: 'beginner',
      estimatedTime: '5 min',
      popularity: 95,
      trending: true,
      featured: true
    },
    {
      id: 2,
      title: "Hiring Success Story",
      category: "Hiring",
      template: "Welcome to the team, {new_hire_name}! 👋\n\nWe're thrilled to have {pronoun} join our {department} team as {role}. {personal_note}\n\n{new_hire_name} brings {experience_highlight} and we can't wait to see the impact {pronoun}'ll make!\n\n#WelcomeToTheTeam #Hiring",
      variables: [
        { key: 'new_hire_name', label: 'New Hire Name', placeholder: 'John Doe', value: '', type: 'text' },
        { key: 'pronoun', label: 'Pronoun', placeholder: 'they', value: '', type: 'select', options: ['they', 'he', 'she'] },
        { key: 'department', label: 'Department', placeholder: 'Engineering', value: '', type: 'text' },
        { key: 'role', label: 'Role', placeholder: 'Senior Developer', value: '', type: 'text' },
        { key: 'personal_note', label: 'Personal Note', placeholder: 'Something personal about the hire', value: '', type: 'text' },
        { key: 'experience_highlight', label: 'Experience Highlight', placeholder: 'Key experience or skill', value: '', type: 'text' }
      ],
      platforms: ["LinkedIn", "Twitter"],
      points: 20,
      tone: 'professional',
      hashtags: ['NewHire', 'TeamGrowth', 'Hiring'],
      mentions: [],
      difficulty: 'intermediate',
      estimatedTime: '7 min',
      popularity: 88,
      trending: false,
      featured: true
    },
    {
      id: 3,
      title: "Industry Thought Leadership",
      category: "Thought Leadership",
      template: "🤔 Been thinking about {industry_topic} lately...\n\nHere's what I've observed: {observation}\n\nMy take? {personal_opinion}\n\nWhat's your experience been? Would love to hear your thoughts! 💭\n\n{question_for_audience}",
      variables: [
        { key: 'industry_topic', label: 'Industry Topic', placeholder: 'remote work trends', value: '', type: 'text' },
        { key: 'observation', label: 'Your Observation', placeholder: 'What you\'ve noticed in the industry', value: '', type: 'text' },
        { key: 'personal_opinion', label: 'Your Opinion', placeholder: 'Your perspective on the topic', value: '', type: 'text' },
        { key: 'question_for_audience', label: 'Question for Audience', placeholder: 'How do you handle this challenge?', value: '', type: 'text' }
      ],
      platforms: ["LinkedIn", "Twitter"],
      points: 30,
      tone: 'informative',
      hashtags: ['ThoughtLeadership', 'Industry', 'Discussion'],
      mentions: [],
      difficulty: 'advanced',
      estimatedTime: '10 min',
      popularity: 76,
      trending: true,
      featured: false
    },
    {
      id: 4,
      title: "Company Culture Showcase",
      category: "Culture",
      template: "Love working at a place where {culture_value} isn't just a poster on the wall - it's how we actually operate! 💜\n\nToday's example: {specific_example}\n\nThis is exactly why I'm proud to be part of {company_name}. {personal_reflection}\n\n#CompanyCulture #Values",
      variables: [
        { key: 'culture_value', label: 'Culture Value', placeholder: 'transparency', value: '', type: 'select', options: ['transparency', 'innovation', 'collaboration', 'diversity', 'growth', 'integrity'] },
        { key: 'specific_example', label: 'Specific Example', placeholder: 'A recent example of this value in action', value: '', type: 'text' },
        { key: 'company_name', label: 'Company Name', placeholder: 'YourCompany', value: '', type: 'text' },
        { key: 'personal_reflection', label: 'Personal Reflection', placeholder: 'How this impacts you personally', value: '', type: 'text' }
      ],
      platforms: ["LinkedIn", "Instagram", "Facebook"],
      points: 18,
      tone: 'casual',
      hashtags: ['CompanyCulture', 'Values', 'WorkLife'],
      mentions: [],
      difficulty: 'beginner',
      estimatedTime: '5 min',
      popularity: 82,
      trending: false,
      featured: false
    },
    {
      id: 5,
      title: "Achievement Celebration",
      category: "Team Wins",
      template: "🏆 Celebrating a huge win for our {team_name} team!\n\n{achievement_description}\n\nShoutout to {team_members} for making this happen! The dedication and {specific_quality} you all showed was incredible.\n\n{impact_statement}\n\n#TeamWin #Proud",
      variables: [
        { key: 'team_name', label: 'Team Name', placeholder: 'Product', value: '', type: 'text' },
        { key: 'achievement_description', label: 'Achievement', placeholder: 'What was accomplished', value: '', type: 'text' },
        { key: 'team_members', label: 'Team Members', placeholder: '@john @jane @bob', value: '', type: 'text' },
        { key: 'specific_quality', label: 'Team Quality', placeholder: 'teamwork', value: '', type: 'select', options: ['teamwork', 'creativity', 'persistence', 'innovation', 'collaboration'] },
        { key: 'impact_statement', label: 'Impact Statement', placeholder: 'How this helps customers/company', value: '', type: 'text' }
      ],
      platforms: ["LinkedIn", "Twitter", "Slack"],
      points: 22,
      tone: 'enthusiastic',
      hashtags: ['TeamWin', 'Achievement', 'Collaboration'],
      mentions: [],
      difficulty: 'intermediate',
      estimatedTime: '6 min',
      popularity: 91,
      trending: true,
      featured: true
    }
  ];

  const categoryIcons = {
    "Hiring": Users,
    "Product": Rocket,
    "Culture": Award,
    "Thought Leadership": Lightbulb,
    "Team Wins": Briefcase
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity;
      case 'points':
        return b.points - a.points;
      case 'recent':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const categories = ['all', ...new Set(templates.map(t => t.category.toLowerCase()))];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Template Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <Button variant="outline" className="border-white/20">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="bg-white/10">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category === 'all' ? 'All' : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTemplates.map((template, index) => {
          const Icon = categoryIcons[template.category as keyof typeof categoryIcons] || Rocket;
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`bg-white/10 backdrop-blur-md border-white/20 cursor-pointer transition-all hover:bg-white/15 h-full ${
                  template.featured ? 'border-neon-purple/40' : ''
                }`}
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-neon-purple" />
                      {template.featured && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                      {template.trending && <TrendingUp className="h-4 w-4 text-green-400" />}
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      +{template.points} pts
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-lg">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-white/70 text-sm line-clamp-2">{template.template}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                    <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/60">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {template.popularity}% popular
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
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
      </div>

      {/* Create Custom Template */}
      <Card className="bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border-neon-purple/20">
        <CardContent className="p-6 text-center">
          <Plus className="h-12 w-12 text-neon-purple mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Create Custom Template</h3>
          <p className="text-white/70 mb-4">
            Build your own template with custom variables and settings
          </p>
          <Button className="bg-gradient-to-r from-neon-purple to-neon-blue">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
