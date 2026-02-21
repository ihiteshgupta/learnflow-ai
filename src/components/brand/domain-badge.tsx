import { Code, Database, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Domain = 'python' | 'data-science' | 'machine-learning';

const domainConfig: Record<Domain, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  python: { label: 'Python', Icon: Code },
  'data-science': { label: 'Data Science', Icon: Database },
  'machine-learning': { label: 'AI/ML', Icon: Sparkles },
};

interface DomainBadgeProps {
  domain: Domain | string;
}

export function DomainBadge({ domain }: DomainBadgeProps) {
  const config = domainConfig[domain as Domain] ?? { label: domain, Icon: Code };
  const { label, Icon } = config;

  return (
    <Badge variant="secondary" className="gap-1.5">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
