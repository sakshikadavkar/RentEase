const baseClasses =
  'inline-flex items-center gap-1 rounded-full font-semibold tracking-wide';

const variantClasses = {
  primary: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
  danger: 'bg-red-50 text-red-700 border border-red-200/80',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80',
  dark: 'bg-slate-950 text-white border border-slate-800',
  glass: 'bg-white/90 text-slate-900 backdrop-blur-md border border-white/80 shadow-sm',
};

const sizeClasses = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  ...props
}) {
  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant] || variantClasses.neutral,
        sizeClasses[size] || sizeClasses.sm,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

