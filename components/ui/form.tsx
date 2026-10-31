import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none transition",
        "placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition",
        "placeholder:text-muted-2 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition",
        "focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1.5 block text-xs font-semibold text-muted", className)} {...props} />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("vz-panel p-5", className)}
      {...props}
    />
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-medium text-danger"
    >
      {message}
    </p>
  );
}
