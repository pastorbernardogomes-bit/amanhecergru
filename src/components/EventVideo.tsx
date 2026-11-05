import type { VideoHTMLAttributes } from 'react';

type EventVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'poster' | 'src' | 'children'> & {
  videoNumber: 1 | 2 | 3;
  src: string;
  title: string;
};

export default function EventVideo({
  videoNumber,
  src,
  title,
  className = '',
  controls = true,
  preload = 'none',
  playsInline = true,
  ...props
}: EventVideoProps) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <video
        {...props}
        src={src}
        title={title}
        aria-label={props['aria-label'] ?? title}
        poster={`/event-covers/video-${videoNumber}.svg`}
        controls={controls}
        preload={preload}
        playsInline={playsInline}
        className={`aspect-video w-full bg-muted object-contain ${className}`}
      >
        Seu navegador não suporta a reprodução deste vídeo.
      </video>
      <figcaption className="px-4 py-3 text-sm font-medium">{title}</figcaption>
    </figure>
  );
}
