import { Chip } from '@heroui/react';
import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'primary' | 'neutral';

const variantMap: Record<BadgeVariant, { color: 'success' | 'warning' | 'danger' | 'accent' | 'default'; variant: 'soft' | 'secondary' }> = {
  success: { color: 'success', variant: 'soft' },
  warning: { color: 'warning', variant: 'soft' },
  danger: { color: 'danger', variant: 'soft' },
  info: { color: 'accent', variant: 'soft' },
  secondary: { color: 'default', variant: 'secondary' },
  primary: { color: 'accent', variant: 'soft' },
  neutral: { color: 'default', variant: 'secondary' },
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export default function Badge({ variant = 'neutral', children }: BadgeProps) {
  const v = variantMap[variant];
  return (
    <Chip color={v.color} size="sm" variant={v.variant}>
      {children}
    </Chip>
  );
}
