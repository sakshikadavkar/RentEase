const baseClasses =
  'rounded-2xl transition-all duration-250 ease-out';

const surfaceClasses = {
  light: 'bg-white',
  muted: 'bg-slate-50/80',
  dark: 'bg-slate-950 text-white',
};

const paddingClasses = {
  none: '',
  xs: 'p-3',
  sm: 'p-4 sm:p-5',
  md: 'p-5 sm:p-6 lg:p-7',
  lg: 'p-6 sm:p-8 lg:p-10',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-xs shadow-slate-200/50',
  md: 'shadow-sm shadow-slate-200/80',
  lg: 'shadow-md shadow-slate-200/90',
  xl: 'shadow-xl shadow-slate-200/80',
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  bordered = true,
  shadow = 'md',
  tone = 'light',
  ...props
}) {
  return (
    <div
      className={cn(
        baseClasses,
        surfaceClasses[tone] || surfaceClasses.light,
        paddingClasses[padding] ?? paddingClasses.md,
        shadowClasses[shadow] ?? shadowClasses.md,
        bordered
          ? tone === 'dark'
            ? 'border border-slate-800'
            : 'border border-slate-200/80'
          : '',
        hover
          ? 'hover:-translate-y-1 hover:border-blue-200/80 hover:shadow-lg hover:shadow-slate-200/90'
          : '',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

