import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Link as LinkIcon, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { DragDropUpload } from '../components/DragDropUpload';
import { cn } from '@/lib/utils';

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

interface EnhancedBasicInfoTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
  errors?: Record<string, string>;
  onFieldFocus?: (field: string) => void;
}

export const EnhancedBasicInfoTab: React.FC<EnhancedBasicInfoTabProps> = ({
  formData,
  updateFormData,
  errors = {},
  onFieldFocus
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logoUrl || null);
  const [urlValidation, setUrlValidation] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [wordCount, setWordCount] = useState({
    shortDescription: 0,
    description: 0
  });

  // Update word counts when form data changes
  useEffect(() => {
    setWordCount({
      shortDescription: (formData.shortDescription || '').split(' ').filter(word => word.length > 0).length,
      description: (formData.description || '').split(' ').filter(word => word.length > 0).length
    });
  }, [formData.shortDescription, formData.description]);

  // Validate URL when external URL changes
  useEffect(() => {
    if (!formData.externalUrl) {
      setUrlValidation('idle');
      return;
    }

    setUrlValidation('checking');
    const timeoutId = setTimeout(() => {
      try {
        new URL(formData.externalUrl);
        setUrlValidation('valid');
      } catch {
        setUrlValidation('invalid');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.externalUrl]);

  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    
    // Store the logo file in a way that triggers form updates without TypeScript errors
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
    updateFormData({ logoUrl: null });
  };

  const getFieldValidation = (field: string, value: any) => {
    if (errors[field]) return 'error';
    
    switch (field) {
      case 'name':
        return value?.length >= 3 ? 'success' : value?.length > 0 ? 'warning' : 'idle';
      case 'shortDescription':
        return value?.length >= 10 && value?.length <= 100 ? 'success' : value?.length > 0 ? 'warning' : 'idle';
      case 'description':
        return value?.length >= 50 ? 'success' : value?.length > 0 ? 'warning' : 'idle';
      case 'externalUrl':
        return urlValidation === 'valid' ? 'success' : urlValidation === 'invalid' ? 'error' : 'idle';
      default:
        return 'idle';
    }
  };

  const getValidationIcon = (state: string) => {
    switch (state) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const generateAIDescription = () => {
    if (!formData.name || !formData.category) return;
    
    // Simple AI-like description generation based on name and category
    const templates = {
      "Business Solution": `${formData.name} is a comprehensive business solution designed to streamline operations and enhance productivity. It offers powerful features to help organizations optimize their workflows and achieve better results.`,
      "Analytics Tool": `${formData.name} is an advanced analytics platform that transforms data into actionable insights. Designed for businesses seeking data-driven decision making and comprehensive reporting capabilities.`,
      "Marketing Platform": `${formData.name} is a cutting-edge marketing platform that empowers businesses to create, manage, and optimize their marketing campaigns with precision and effectiveness.`,
      "Collaboration Tool": `${formData.name} is a modern collaboration solution that connects teams and enhances communication. Perfect for remote and hybrid work environments.`,
      "Customer Service": `${formData.name} is a customer service platform that delivers exceptional support experiences and helps businesses build stronger customer relationships.`,
      "E-Commerce": `${formData.name} is a robust e-commerce solution that provides everything needed to build, manage, and scale online businesses successfully.`,
      "Development Tool": `${formData.name} is a developer-focused tool that enhances productivity and simplifies complex development workflows for modern software teams.`,
      "Integration Tool": `${formData.name} is a powerful integration platform that connects different systems and applications, enabling seamless data flow and process automation.`,
      "Other": `${formData.name} is an innovative solution that addresses specific business needs with advanced features and user-friendly design.`
    };

    const generated = templates[formData.category as keyof typeof templates] || templates["Other"];
    updateFormData({ description: generated });
  };

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Solution Logo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <DragDropUpload
              onFileSelect={handleLogoSelect}
              currentPreview={logoPreview}
              onRemove={handleLogoRemove}
              className="flex-shrink-0"
            />
            
            <div className="flex-1 space-y-2">
              <h4 className="font-medium">Logo Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Recommended: 512x512px (square format)</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Supported formats: PNG, JPG, WebP</li>
                <li>• Use high-contrast images for best visibility</li>
              </ul>
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
              <Label htmlFor="name" className="flex items-center gap-2">
                Solution Name 
                <span className="text-destructive">*</span>
                {getValidationIcon(getFieldValidation('name', formData.name))}
              </Label>
              <Input
                id="name"
                placeholder="e.g., Enterprise Analytics Dashboard"
                value={formData.name || ''}
                onChange={(e) => updateFormData({ name: e.target.value })}
                onFocus={() => onFieldFocus?.('name')}
                className={cn(
                  errors.name && "border-destructive focus:border-destructive",
                  getFieldValidation('name', formData.name) === 'success' && "border-success"
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Choose a clear, descriptive name (minimum 3 characters)
              </p>
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
              <p className="text-xs text-muted-foreground">
                Help users find your solution in the right category
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shortDescription" className="flex items-center gap-2">
              Short Description
              {getValidationIcon(getFieldValidation('shortDescription', formData.shortDescription))}
            </Label>
            <Input
              id="shortDescription"
              placeholder="Brief one-line description of your solution"
              value={formData.shortDescription || ''}
              onChange={(e) => updateFormData({ shortDescription: e.target.value })}
              onFocus={() => onFieldFocus?.('shortDescription')}
              className={cn(
                getFieldValidation('shortDescription', formData.shortDescription) === 'success' && "border-success"
              )}
            />
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                Appears in search results and solution previews
              </p>
              <span className={cn(
                "text-xs",
                wordCount.shortDescription > 100 ? "text-destructive" : 
                wordCount.shortDescription >= 10 ? "text-success" : "text-muted-foreground"
              )}>
                {wordCount.shortDescription} / 100 chars
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              Detailed Description
              {getValidationIcon(getFieldValidation('description', formData.description))}
              {formData.name && formData.category && (
                <button
                  type="button"
                  onClick={generateAIDescription}
                  className="ml-auto flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate with AI
                </button>
              )}
            </Label>
            <Textarea 
              id="description"
              placeholder="Provide a comprehensive description of your solution, its purpose, and key capabilities..."
              className={cn(
                "resize-none min-h-[120px]",
                getFieldValidation('description', formData.description) === 'success' && "border-success"
              )}
              value={formData.description || ''}
              onChange={(e) => updateFormData({ description: e.target.value })}
              onFocus={() => onFieldFocus?.('description')}
            />
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                Detailed explanation of what your solution does and its benefits
              </p>
              <span className={cn(
                "text-xs",
                wordCount.description >= 50 ? "text-success" : "text-muted-foreground"
              )}>
                {wordCount.description} words (min 50)
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="externalUrl" className="flex items-center gap-2">
              Website URL
              {getValidationIcon(getFieldValidation('externalUrl', formData.externalUrl))}
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="externalUrl"
                placeholder="https://yoursolution.com"
                className={cn(
                  "pl-10",
                  urlValidation === 'valid' && "border-success",
                  urlValidation === 'invalid' && "border-destructive"
                )}
                value={formData.externalUrl || ''}
                onChange={(e) => updateFormData({ externalUrl: e.target.value })}
                onFocus={() => onFieldFocus?.('externalUrl')}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Link to your solution's homepage or landing page
            </p>
          </div>

          {/* Quick Stats */}
          <div className="pt-4 border-t border-border/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">
                  {getFieldValidation('name', formData.name) === 'success' ? '✓' : '○'}
                </div>
                <div className="text-xs text-muted-foreground">Name</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {getFieldValidation('description', formData.description) === 'success' ? '✓' : '○'}
                </div>
                <div className="text-xs text-muted-foreground">Description</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {logoPreview ? '✓' : '○'}
                </div>
                <div className="text-xs text-muted-foreground">Logo</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};