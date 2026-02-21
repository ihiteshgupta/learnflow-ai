import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="p-2 rounded-md bg-muted text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
