import { useId } from 'react';
import type { ComponentProps } from 'react';
import EventQuestions from './EventQuestions';
import EventVideo from './EventVideo';

type Video = {
  src: string;
  title: string;
};

type EventContentProps = {
  supabase: ComponentProps<typeof EventQuestions>['supabase'];
  videos: readonly [Video, Video, Video];
};

const videoNumbers = [1, 2, 3] as const;

export default function EventContent({ supabase, videos }: EventContentProps) {
  const id = useId();

  return (
    <div className="w-full bg-background px-4 py-12 text-foreground sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 sm:gap-16">
        <section aria-labelledby={`${id}-videos`} className="space-y-6">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              GUARULHOS-SP
            </p>
            <h2 id={`${id}-videos`} className="text-2xl font-bold tracking-tight sm:text-3xl">
              Conheça o evento
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Assista aos vídeos e envie suas dúvidas no formulário abaixo.
            </p>
            <a
              href={`#${id}-questions`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Perguntar sobre o evento
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {videoNumbers.map((videoNumber) => {
              const video = videos[videoNumber - 1];
              return (
                <EventVideo
                  key={videoNumber}
                  videoNumber={videoNumber}
                  src={video.src}
                  title={video.title}
                />
              );
            })}
          </div>
        </section>

        <div id={`${id}-questions`} className="scroll-mt-24">
          <EventQuestions supabase={supabase} />
        </div>
      </div>
    </div>
  );
}
