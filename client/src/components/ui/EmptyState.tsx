import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    {Icon ? (
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-background-secondary text-fg-muted">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    ) : null}
    <p className="text-sm font-medium text-fg">{title}</p>
    {description ? <p className="mt-1.5 max-w-sm text-sm text-fg-muted">{description}</p> : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

export default EmptyState;
