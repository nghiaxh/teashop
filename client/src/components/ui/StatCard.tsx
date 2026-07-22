import { Card } from '@heroui/react';
import type { ReactNode } from 'react';

type StatColor = 'primary' | 'success' | 'secondary' | 'warning' | 'info';

const colorClasses: Record<StatColor, { bg: string; text: string }> = {
  primary: { bg: 'bg-foreground/5', text: 'text-foreground' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
  info: { bg: 'bg-info/10', text: 'text-info' },
};

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: StatColor;
}

export default function StatCard({ icon, label, value, color = 'primary' }: StatCardProps) {
  const c = colorClasses[color];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <span className={c.text}>{icon}</span>
        </div>
        <div>
          <p className="text-xs text-foreground/50">{label}</p>
          <p className="text-xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );
}
