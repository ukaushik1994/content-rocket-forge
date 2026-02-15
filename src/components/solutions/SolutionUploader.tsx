
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Check, X, Info, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function SolutionUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };
  
  const validateAndSetFile = (file: File) => {
    // Check if it's a CSV or Excel file
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Please upload a CSV or Excel file.');
      return;
    }
    
    setFile(file);
    toast.success('File uploaded successfully!');
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Card className="overflow-hidden neon-border">
      <CardHeader>
        <CardTitle className="text-gradient">Offering Uploader</CardTitle>
        <CardDescription>
          Upload your business offerings to include them in your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4 pt-4">
            <div 
              className={`border-2 border-dashed rounded-md p-8 text-center ${isDragging ? 'border-primary bg-primary/10' : 'border-white/20'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/20 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Drag & drop your file here</h3>
                  <p className="text-sm text-muted-foreground">
                    Files should be CSV or Excel with the required columns
                  </p>
                </div>
                
                <div>
                  <Input 
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Select File</span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
            
            {file && (
              <div className="bg-glass rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className="h-8 w-8 rounded-full bg-primary">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="bg-primary/10 rounded-md p-3 flex items-start gap-3 border border-primary/30">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">File Format Requirements</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Include columns: Solution Name, Features, Use Cases, Pain Points, Target Audience, CTA</li>
                  <li>Separate multiple values in a cell with commas</li>
                  <li>UTF-8 encoding is recommended</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Solution Name</label>
                <Input placeholder="e.g. TaskMaster Pro" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Features</label>
                <Input placeholder="e.g. Gantt charts, team collaboration, AI analytics" />
                <p className="text-xs text-muted-foreground">Separate multiple features with commas</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Use Cases</label>
                <Input placeholder="e.g. Remote teams, agile workflows" />
                <p className="text-xs text-muted-foreground">Separate multiple use cases with commas</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Pain Points</label>
                <Input placeholder="e.g. Missed deadlines, poor task visibility" />
                <p className="text-xs text-muted-foreground">Separate multiple pain points with commas</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Input placeholder="e.g. Project managers, IT teams" />
                <p className="text-xs text-muted-foreground">Separate multiple audiences with commas</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Call To Action</label>
                <Input placeholder="e.g. Start a free trial" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-white/10 pt-4">
        <Button variant="ghost">
          Cancel
        </Button>
        <Button className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
          Add Offering
        </Button>
      </CardFooter>
    </Card>
  );
}
