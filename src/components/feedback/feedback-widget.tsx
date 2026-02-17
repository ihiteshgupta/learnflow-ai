'use client';

import { useState } from 'react';
import { MessageSquarePlus, Bug, Lightbulb, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';

type FeedbackType = 'bug' | 'feature' | 'general';

const feedbackTypes: { value: FeedbackType; label: string; icon: typeof Bug }[] = [
  { value: 'bug', label: 'Bug', icon: Bug },
  { value: 'feature', label: 'Feature', icon: Lightbulb },
  { value: 'general', label: 'General', icon: MessageCircle },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const submitMutation = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast({ title: 'Thank you!', description: 'Your feedback has been submitted.' });
      setMessage('');
      setType('general');
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  function handleSubmit() {
    const page = typeof window !== 'undefined' ? window.location.pathname : undefined;
    submitMutation.mutate({ type, message, page });
  }

  const isValid = message.trim().length >= 10;

  return (
    <>
      {/* Floating trigger button */}
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="h-5 w-5" />
      </Button>

      {/* Feedback dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Help us improve Dronacharya. Bug reports, feature ideas, or general thoughts are all welcome.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type selector */}
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                {feedbackTypes.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      type === value
                        ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]'
                        : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message textarea */}
            <div className="space-y-2">
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea
                id="feedback-message"
                placeholder="Describe what happened, what you expected, or what you'd like to see..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              {message.length > 0 && message.trim().length < 10 && (
                <p className="text-xs text-destructive">
                  At least 10 characters required ({10 - message.trim().length} more)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || submitMutation.isPending}
              className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
