
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Key, Copy, Check, Trash, RefreshCw, EyeOff, Eye, AlertCircle, Calendar } from 'lucide-react';
import { toast } from "sonner";
import { ApiProviderConfig } from '@/components/settings/api/types';

export interface ProviderKeyManagerProps {
  provider: ApiProviderConfig;
  apiKey: string;
  keyExists: boolean;
  onSave: (key: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  className?: string;
}

export const ProviderKeyManager = ({ 
  provider, 
  apiKey, 
  keyExists, 
  onSave, 
  onDelete, 
  className 
}: ProviderKeyManagerProps) => {
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [copiedKey, setCopiedKey] = useState(false);
  
  // Format the displayed key based on if it should be shown or masked
  const formatKeyForDisplay = (key: string) => {
    if (!key) return '';
    if (showKey) return key;
    
    // Create a masked version showing only first and last 4 chars
    if (key.length <= 8) return '•'.repeat(key.length);
    return `${key.substring(0, 4)}${'•'.repeat(Math.min(key.length - 8, 12))}${key.substring(key.length - 4)}`;
  };
  
  // Handle copying key to clipboard
  const handleCopyKey = async () => {
    if (!apiKey) return;
    
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };
  
  // Handle saving a new key
  const handleSaveKey = async () => {
    if (!newKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    try {
      setIsSaving(true);
      const success = await onSave(newKey);
      
      if (success) {
        toast.success(`${provider.name} API key saved successfully`);
        setNewKey('');
        setActiveTab('current');
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to save ${provider.name} API key`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle key rotation (replacing existing key)
  const handleRotateKey = async () => {
    if (!newKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    try {
      setIsRotating(true);
      const success = await onSave(newKey);
      
      if (success) {
        toast.success(`${provider.name} API key rotated successfully`);
        setNewKey('');
        setActiveTab('current');
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to rotate ${provider.name} API key`);
    } finally {
      setIsRotating(false);
    }
  };
  
  // Handle deleting a key
  const handleDeleteKey = async () => {
    try {
      setIsDeleting(true);
      const success = await onDelete();
      
      if (success) {
        toast.success(`${provider.name} API key deleted successfully`);
        setConfirmDelete(false);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${provider.name} API key`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className={className}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Key className="h-4 w-4 mr-2" />
            Manage API Key
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{provider.name} API Key Management</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="current">Current Key</TabsTrigger>
              <TabsTrigger value="new">Add/Replace Key</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4">
              {apiKey ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>API Key</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowKey(!showKey)}
                        className="h-6 px-2"
                      >
                        {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
                      </Button>
                    </Label>
                    
                    <div className="flex">
                      <div className="bg-black/20 p-2 px-3 border border-white/10 rounded-l-md flex-grow font-mono text-xs overflow-hidden text-ellipsis">
                        {formatKeyForDisplay(apiKey)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-l-none"
                        onClick={handleCopyKey}
                      >
                        {copiedKey ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>Added: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('new')}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rotate Key
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      onClick={() => setConfirmDelete(true)}
                      className="flex-1"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Key
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground">No API key has been added yet.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('new')}
                    className="mt-2"
                  >
                    Add API Key
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="new" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-api-key">New API Key</Label>
                <Input
                  id="new-api-key"
                  type={showKey ? "text" : "password"}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder={`Enter ${provider.name} API key`}
                  className="font-mono"
                />
                
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowKey(!showKey)}
                    className="text-xs h-auto p-0"
                  >
                    {showKey ? (
                      <span className="flex items-center"><EyeOff size={12} className="mr-1" /> Hide key</span>
                    ) : (
                      <span className="flex items-center"><Eye size={12} className="mr-1" /> Show key</span>
                    )}
                  </Button>
                  
                  {provider.docsUrl && (
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-blue-400 hover:text-blue-300"
                    >
                      Get API Key
                    </a>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                
                <Button
                  onClick={keyExists ? handleRotateKey : handleSaveKey}
                  disabled={isSaving || isRotating || !newKey}
                >
                  {isSaving || isRotating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {keyExists ? 'Rotating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      {keyExists ? 'Replace Key' : 'Save Key'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your {provider.name} API key? 
              This will remove it from secure storage and you'll need to add it again to use {provider.name} features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteKey}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Key'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
