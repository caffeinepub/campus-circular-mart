import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Please enter your display name.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    try {
      await saveProfile({ name: trimmed, displayName: trimmed });
      toast.success('Welcome to Campus Circular Mart!');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-serif">Welcome, Student!</DialogTitle>
          <DialogDescription className="text-center">
            Set up your display name so other students can identify you as a seller.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="e.g. Alex Johnson"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              autoFocus
              maxLength={50}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isPending}
          >
            {isPending ? 'Saving…' : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
