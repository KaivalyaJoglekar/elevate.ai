import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = "Analysis Failed",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 px-6 text-center",
        "glass-card border-red-500/20",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>
      <p className="text-sm font-medium text-ev-text mb-1">{title}</p>
      <p className="text-xs text-ev-text-secondary max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-xs font-medium text-ev-gold border border-ev-gold/30 rounded-lg hover:bg-ev-gold/10 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
