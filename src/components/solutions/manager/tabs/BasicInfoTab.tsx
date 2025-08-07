
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

const SOLUTION_CATEGORIES = [
  "Business Solution",
  "Analytics Tool",
  "Marketing Platform",
  "Collaboration Tool",
  "Customer Service",
  "E-Commerce",
  "Development Tool",
  "Integration Tool",
  "Other"
];

interface BasicInfoTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  logoPreview: string | null;
  setLogoPreview: (url: string | null) => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  updateFormData,
  logoFile,
  setLogoFile,
  logoPreview,
  setLogoPreview
}) => {
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Solution Logo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 rounded-xl border border-border">
                {logoPreview ? (
                  <AvatarImage 
                    src={logoPreview} 
                    alt="Solution logo"
                    className="object-cover rounded-xl"
                  />
                ) : (
                  <AvatarFallback className="rounded-xl bg-muted text-muted-foreground">
                    {formData.name ? getInitials(formData.name) : <Building2 className="h-8 w-8" />}
                  </AvatarFallback>
                )}
              </Avatar>
              {logoPreview && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={removeLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex-1">
              <Input 
                id="logo-upload" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleLogoChange} 
              />
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: 512x512px, max 5MB. PNG, JPG, or WebP formats.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Solution Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Enterprise Analytics Dashboard"
                value={formData.name || ''}
                onChange={(e) => {
                  console.log('Name changed:', e.target.value);
                  updateFormData({ name: e.target.value });
                }}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => updateFormData({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SOLUTION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.category === 'Other' && (
                <div className="space-y-2">
                  <Label htmlFor="customCategory">Specify category</Label>
                  <Input
                    id="customCategory"
                    placeholder="Enter custom category"
                    value={(formData.metadata as any)?.customCategory || ''}
                    onChange={(e) =>
                      updateFormData({
                        metadata: {
                          ...(formData.metadata || {}),
                          customCategory: e.target.value,
                        } as any,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="Brief one-line description of your solution"
              value={formData.shortDescription || ''}
              onChange={(e) => updateFormData({ shortDescription: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea 
              id="description"
              placeholder="Provide a comprehensive description of your solution, its purpose, and key capabilities..."
              className="resize-none min-h-[100px]"
              value={formData.description || ''}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="externalUrl">Website URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="externalUrl"
                placeholder="https://yoursolution.com"
                className="pl-10"
                value={formData.externalUrl || ''}
                onChange={(e) => updateFormData({ externalUrl: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
