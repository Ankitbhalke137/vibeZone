import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm outline-none transition",
        "placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-muted", className)} {...props} />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}
      {...props}
    />
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
      {message}
    </p>
  );
}
