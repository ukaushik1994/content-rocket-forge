import React from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, Target, Palette, ListChecks } from 'lucide-react';

export const ContentBriefQuestions = () => {
  const { state, dispatch } = useContentBuilder();
  const brief = state.contentBrief || { targetAudience: '', contentGoal: '', tone: '', specificPoints: '' };

  const updateBrief = (field: string, value: string) => {
    dispatch({
      type: 'SET_CONTENT_BRIEF',
      payload: { ...brief, [field]: value }
    });
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-indigo-400" />
          Content Brief
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Help us tailor the content to your needs
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Target Audience
            </Label>
            <Select value={brief.targetAudience} onValueChange={(v) => updateBrief('targetAudience', v)}>
              <SelectTrigger className="bg-background/40 border-border/50 h-9 text-sm">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="professionals">Professionals</SelectItem>
                <SelectItem value="beginners">Beginners</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="developers">Developers</SelectItem>
                <SelectItem value="marketers">Marketers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Target className="h-3 w-3" /> Content Goal
            </Label>
            <Select value={brief.contentGoal} onValueChange={(v) => updateBrief('contentGoal', v)}>
              <SelectTrigger className="bg-background/40 border-border/50 h-9 text-sm">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educate">Educate</SelectItem>
                <SelectItem value="convert">Convert</SelectItem>
                <SelectItem value="engage">Engage</SelectItem>
                <SelectItem value="rank">Rank Higher</SelectItem>
                <SelectItem value="authority">Build Authority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Palette className="h-3 w-3" /> Tone & Style
            </Label>
            <Select value={brief.tone} onValueChange={(v) => updateBrief('tone', v)}>
              <SelectTrigger className="bg-background/40 border-border/50 h-9 text-sm">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Specific Points to Include (optional)</Label>
          <Textarea
            value={brief.specificPoints}
            onChange={(e) => updateBrief('specificPoints', e.target.value)}
            placeholder="Any specific topics, pain points, or angles you want covered..."
            className="bg-background/40 border-border/50 resize-none text-sm min-h-[60px]"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};
