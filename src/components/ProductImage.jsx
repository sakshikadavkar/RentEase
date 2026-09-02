import { useState } from 'react';

export default function ProductImage({
  src,
  alt,
  className = '',
  imageClassName = '',
  priority = false,
}) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [imageSrc, setImageSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImageSrc(src);
    setLoaded(false);
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {/* Background shimmer placeholder */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200/60 to-slate-100" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setImageSrc('/hero.png');
          setLoaded(true);
        }}
        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imageClassName}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/15 via-transparent to-white/10" />
    </div>
  );
}

