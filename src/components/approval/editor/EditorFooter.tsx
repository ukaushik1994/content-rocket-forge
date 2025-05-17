
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText } from 'lucide-react';

interface EditorFooterProps {
  approvalNotes: string;
  setApprovalNotes: React.Dispatch<React.SetStateAction<string>>;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({
  approvalNotes,
  setApprovalNotes
}) => {
  return (
    <div className="w-full space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2 text-white/80">Approval Notes</h4>
        <Textarea 
          placeholder="Add any notes, feedback, or comments about this content..."
          value={approvalNotes}
          onChange={(e) => setApprovalNotes(e.target.value)}
          className="min-h-[100px] bg-gray-800/30 border-white/10 focus-visible:ring-neon-purple/50"
        />
      </div>
      
      <Alert className="border-amber-600/30 bg-amber-600/10">
        <FileText className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-200">
          Review and update the content before approving. Once approved, the content will be published and visible to all users.
        </AlertDescription>
      </Alert>
    </div>
  );
};
