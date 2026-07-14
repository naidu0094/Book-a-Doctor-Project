import type { ReactNode } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

const config = {
  error: { bg: 'bg-error-50 dark:bg-error-900/20', text: 'text-error-700 dark:text-error-400', icon: 'text-error-500' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-700 dark:text-success-400', icon: 'text-success-500' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-700 dark:text-warning-400', icon: 'text-warning-500' },
  info: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-700 dark:text-primary-400', icon: 'text-primary-500' },
};

export default function Alert({ type = 'error', message, onClose, className }: AlertProps) {
  const c = config[type];
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${c.bg} ${c.text} ${className ?? ''}`}>
      <AlertCircle className={`w-5 h-5 flex-shrink-0 ${c.icon}`} />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{message}</p>
      {action}
    </div>
  );
}
