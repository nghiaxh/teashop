import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {icon && <div className="text-foreground/20">{icon}</div>}
      <p className="text-sm text-foreground/40">{message}</p>
      {action}
    </div>
  );
}
