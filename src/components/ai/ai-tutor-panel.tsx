'use client';

import { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { QuickActions } from './quick-actions';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorPanelProps {
  lessonId?: string;
  className?: string;
  onSendMessage?: (message: string) => Promise<string>;
}

export function AITutorPanel({
  lessonId: _lessonId,
  className,
  onSendMessage,
}: AITutorPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI tutor. I'm here to help you understand the concepts in this lesson. Feel free to ask me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = onSendMessage
        ? await onSendMessage(input.trim())
        : "I understand you're asking about this topic. Let me help you think through it...";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  if (isMinimized) {
    return (
      <div className={cn('border rounded-lg bg-background', className)}>
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">AI Tutor</span>
          <Maximize2 className="h-4 w-4 ml-auto" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('h-full flex flex-col border-l', className)}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/ai-tutor.png" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div>
            <h3 className="font-semibold">AI Tutor</h3>
            <p className="text-xs text-muted-foreground">Here to help you learn</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(true)}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}
          {isLoading && (
            <ChatMessage role="assistant" content="" isLoading />
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-3 border-t">
        <QuickActions onSelect={handleQuickAction} disabled={isLoading} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
