'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from 'cn';

export type AlertType = 'error' | 'warning' | 'info' | 'success';

export type AlertMessage = {
  id: string; // must be unique per alert
  type: AlertType;
  title?: string;
  message: string;
};

const alertConfig = {
  error: {
    icon: ExclamationCircleIcon,
    title: 'Error',
    variant: 'destructive' as const,
    className: '',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    title: 'Warning',
    variant: 'default' as const,
    className:
      'border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600',
  },
  info: {
    icon: InformationCircleIcon,
    title: 'Notice',
    variant: 'default' as const,
    className:
      'border-blue-500/50 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-600',
  },
  success: {
    icon: CheckCircleIcon,
    title: 'Success',
    variant: 'default' as const,
    className:
      'border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600',
  },
};

export default function AlertBar({
  alerts,
  duration = 15000,
}: {
  alerts: AlertMessage[];
  duration?: number;
}) {
  const [queue, setQueue] = useState<AlertMessage[]>([]);
  const seen = useRef<Set<string>>(new Set());

  // Add any new alerts to the end of the queue
  useEffect(() => {
    const fresh = alerts.filter((a) => !seen.current.has(a.id));
    if (fresh.length === 0) return;
    fresh.forEach((a) => seen.current.add(a.id));
    setQueue((q) => [...q, ...fresh]);
  }, [alerts]);

  const current = queue[0];

  // Remove the current alert after `duration`, which reveals the next one
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => setQueue((q) => q.slice(1)), duration);
    return () => clearTimeout(timer);
  }, [current?.id, duration]);

  if (!current) return null;

  const { icon: Icon, title, variant, className } = alertConfig[current.type];

  return (
    <Alert
      key={current.id}
      variant={variant}
      role="alert"
      aria-live="polite"
      className={cn('mt-4', className)}
    >
      <Icon />
      <AlertTitle>{current.title ?? title}</AlertTitle>
      <AlertDescription>{current.message}</AlertDescription>
    </Alert>
  );
}