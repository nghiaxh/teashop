import { Spinner } from '@heroui/react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Spinner size="lg" />
      {message && <p className="text-sm text-foreground/50">{message}</p>}
    </div>
  );
}
