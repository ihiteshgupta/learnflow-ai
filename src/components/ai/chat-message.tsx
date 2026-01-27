'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', !isAssistant && 'flex-row-reverse')}
    >
      <Avatar className="h-8 w-8">
        {isAssistant ? (
          <>
            <AvatarImage src="/ai-tutor.png" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div
        className={cn(
          'rounded-lg px-4 py-2 max-w-[80%]',
          isAssistant ? 'bg-muted' : 'bg-primary text-primary-foreground'
        )}
      >
        {isLoading ? (
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
            <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </motion.div>
  );
}
