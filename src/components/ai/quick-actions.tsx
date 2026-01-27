'use client';

import { Button } from '@/components/ui/button';
import { Lightbulb, HelpCircle, Code, BookOpen } from 'lucide-react';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  prompt: string;
}

const defaultActions: QuickAction[] = [
  { icon: Lightbulb, label: 'Hint', prompt: 'Can you give me a hint?' },
  { icon: HelpCircle, label: 'Explain', prompt: 'Can you explain this differently?' },
  { icon: Code, label: 'Example', prompt: 'Can you show me an example?' },
  { icon: BookOpen, label: 'Why?', prompt: 'Why does this work this way?' },
];

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
  actions?: QuickAction[];
  disabled?: boolean;
}

export function QuickActions({
  onSelect,
  actions = defaultActions,
  disabled,
}: QuickActionsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => onSelect(action.prompt)}
          disabled={disabled}
          className="flex-1 min-w-[80px]"
        >
          <action.icon className="h-3 w-3 mr-1" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
