
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, Palette } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BrandGuidelines, getBrandGuidelines, saveBrandGuidelines, initializeDefaultBrandGuidelines } from '@/services/userPreferencesService';
import { toast } from 'sonner';

export function BrandGuidelinesSettings() {
  const [guidelines, setGuidelines] = useState<BrandGuidelines>({
    brandName: '',
    brandTone: '',
    targetAudience: '',
    keyValues: [''],
    doGuidelines: [''],
    dontGuidelines: [''],
    companyDescription: '',
    updatedAt: new Date()
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Load brand guidelines when component mounts
  useEffect(() => {
    const loadGuidelines = async () => {
      // Initialize default brand guidelines if none exist
      await initializeDefaultBrandGuidelines();
      
      // Load guidelines
      const loadedGuidelines = getBrandGuidelines();
      if (loadedGuidelines) {
        setGuidelines(loadedGuidelines);
      }
    };
    
    loadGuidelines();
  }, []);
  
  // Handle adding an item to an array field
  const handleAddItem = (field: 'keyValues' | 'doGuidelines' | 'dontGuidelines') => {
    setGuidelines(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };
  
  // Handle removing an item from an array field
  const handleRemoveItem = (field: 'keyValues' | 'doGuidelines' | 'dontGuidelines', index: number) => {
    setGuidelines(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  
  // Handle updating an item in an array field
  const handleItemChange = (field: 'keyValues' | 'doGuidelines' | 'dontGuidelines', index: number, value: string) => {
    setGuidelines(prev => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      return {
        ...prev,
        [field]: updatedArray
      };
    });
  };
  
  // Handle text field changes
  const handleTextChange = (field: 'brandName' | 'brandTone' | 'targetAudience' | 'companyDescription', value: string) => {
    setGuidelines(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle saving brand guidelines
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Filter out empty items from arrays
      const cleanedGuidelines: Omit<BrandGuidelines, 'updatedAt'> = {
        ...guidelines,
        keyValues: guidelines.keyValues.filter(item => item.trim() !== ''),
        doGuidelines: guidelines.doGuidelines.filter(item => item.trim() !== ''),
        dontGuidelines: guidelines.dontGuidelines.filter(item => item.trim() !== '')
      };
      
      // Validate required fields
      if (!cleanedGuidelines.brandName) {
        toast.error('Brand name is required');
        setIsSaving(false);
        return;
      }
      
      // Save brand guidelines
      const success = await saveBrandGuidelines(cleanedGuidelines);
      
      if (success) {
        toast.success('Brand guidelines saved successfully');
      } else {
        toast.error('Failed to save brand guidelines');
      }
    } catch (error) {
      console.error('Error saving brand guidelines:', error);
      toast.error('An error occurred while saving brand guidelines');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render array field items
  const renderArrayField = (field: 'keyValues' | 'doGuidelines' | 'dontGuidelines', label: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => handleAddItem(field)}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>
      
      {guidelines[field].map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input 
            value={item} 
            onChange={(e) => handleItemChange(field, index, e.target.value)} 
            placeholder={`Enter ${label.toLowerCase()} item...`}
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={() => handleRemoveItem(field, index)}
            className="shrink-0"
          >
            <MinusCircle className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Brand Guidelines</h2>
          <p className="text-muted-foreground">
            Define your brand voice and style to ensure consistent content
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> 
            Brand Identity
          </CardTitle>
          <CardDescription>
            These guidelines will be applied to AI-generated content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name *</Label>
              <Input 
                id="brandName" 
                value={guidelines.brandName} 
                onChange={(e) => handleTextChange('brandName', e.target.value)}
                placeholder="Enter your brand name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input 
                id="targetAudience" 
                value={guidelines.targetAudience} 
                onChange={(e) => handleTextChange('targetAudience', e.target.value)}
                placeholder="E.g. Business professionals aged 25-45"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brandTone">Brand Voice & Tone</Label>
            <Input 
              id="brandTone" 
              value={guidelines.brandTone} 
              onChange={(e) => handleTextChange('brandTone', e.target.value)}
              placeholder="E.g. Professional yet conversational"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyDescription">Company Description</Label>
            <Textarea 
              id="companyDescription" 
              value={guidelines.companyDescription || ''} 
              onChange={(e) => handleTextChange('companyDescription', e.target.value)}
              placeholder="A brief description of your company and its mission"
              className="min-h-[100px]"
            />
          </div>
          
          {renderArrayField('keyValues', 'Key Brand Values')}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderArrayField('doGuidelines', 'Do Guidelines')}
            {renderArrayField('dontGuidelines', 'Don\'t Guidelines')}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Brand Guidelines'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
