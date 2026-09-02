const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold outline-none transition-all duration-200 ease-out focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 select-none';

const variantClasses = {
  primary:
    'bg-blue-600 text-white shadow-sm shadow-blue-600/25 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 active:translate-y-0 focus-visible:ring-blue-200',
  secondary:
    'bg-slate-950 text-white shadow-sm shadow-slate-950/20 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0 focus-visible:ring-slate-300',
  outline:
    'border border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 active:translate-y-0 focus-visible:ring-blue-100',
  ghost:
    'bg-transparent text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-950 active:translate-y-0 focus-visible:ring-slate-200',
};

const sizeClasses = {
  sm: 'px-3.5 py-2 text-xs font-semibold',
  md: 'px-4.5 py-2.5 text-sm font-semibold',
  lg: 'px-6 py-3.5 text-base font-semibold',
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      className={cn(
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}

