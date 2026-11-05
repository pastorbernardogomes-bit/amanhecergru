import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';

type EventQuestionsProps = {
  supabase: {
    functions: {
      invoke: (
        name: string,
        options: { body: { question: string } },
      ) => Promise<{ data: unknown; error: unknown }>;
    };
  };
};

type Answer = {
  question: string;
  text: string;
  source: string | null;
  consultedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function safeSource(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

async function errorMessage(error: unknown, data: unknown): Promise<string> {
  if (isRecord(data) && typeof data.error === 'string') return data.error;
  if (isRecord(error) && error.context instanceof Response) {
    if (error.context.status === 429) {
      return 'Muitas perguntas neste momento. Aguarde um pouco e tente novamente.';
    }
    try {
      const body: unknown = await error.context.clone().json();
      if (isRecord(body) && typeof body.error === 'string') return body.error;
    } catch {
      // Preserve the fallback when the service does not return JSON.
    }
  }
  return 'Não foi possível responder agora. Tente novamente em instantes.';
}

export default function EventQuestions({ supabase }: EventQuestionsProps) {
  const id = useId();
  const sending = useRef(false);
  const [question, setQuestion] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const text = question.trim();
    if (!text || text.length > 2000) {
      setError('Escreva uma pergunta com até 2.000 caracteres.');
      return;
    }

    sending.current = true;
    setPending(true);
    setError('');
    setAnswer(null);
    try {
      const { data, error: invocationError } = await supabase.functions.invoke(
        'event-questions',
        { body: { question: text } },
      );
      if (invocationError || (isRecord(data) && typeof data.error === 'string')) {
        setError(await errorMessage(invocationError, data));
        return;
      }
      if (!isRecord(data) || typeof data.answer !== 'string' || !data.answer.trim()) {
        setError('A resposta veio incompleta. Tente novamente em instantes.');
        return;
      }
      const date = typeof data.consulted_at === 'string'
        ? new Date(data.consulted_at)
        : null;
      setAnswer({
        question: text,
        text: data.answer.trim(),
        source: safeSource(data.source),
        consultedAt: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
      });
    } catch {
      setError('Não foi possível enviar sua pergunta. Confira sua conexão e tente novamente.');
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8"
    >
      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Tire suas dúvidas</p>
        <h2 id={`${id}-title`} className="text-2xl font-bold tracking-tight sm:text-3xl">Pergunte sobre o evento</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Receba uma resposta gerada por IA com base na fonte oficial consultada a cada pergunta.
          Confira as informações importantes na referência indicada.
        </p>
      </div>

      <form onSubmit={handleSubmit} aria-busy={pending} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor={`${id}-question`} className="block text-sm font-medium">Qual é a sua dúvida?</label>
          <textarea
            id={`${id}-question`}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Por exemplo: qual é o horário do evento?"
            rows={4}
            required
            maxLength={2000}
            disabled={pending}
            aria-describedby={`${id}-hint ${id}-count${error ? ` ${id}-error` : ''}`}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
          />
          <div className="flex items-start justify-between gap-4 text-xs text-muted-foreground">
            <p id={`${id}-hint`}>Não inclua CPF, senhas ou outros dados pessoais.</p>
            <span id={`${id}-count`} className="shrink-0 tabular-nums">{question.length}/2.000</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={pending || !question.trim()}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {pending ? 'Consultando informações…' : 'Enviar pergunta'}
        </button>
        {error && (
          <p id={`${id}-error`} role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      <div aria-live="polite" aria-atomic="true" className="mt-5">
        {pending && <p role="status" className="text-sm text-muted-foreground">Buscando a fonte oficial e preparando sua resposta.</p>}
        {answer && (
          <article className="space-y-4 rounded-xl border border-border bg-muted/40 p-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Sua pergunta</h3>
              <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{answer.question}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Resposta</h3>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">{answer.text}</p>
            </div>
            <div className="space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
              {answer.source && (
                <a href={answer.source} target="_blank" rel="noopener noreferrer" className="inline-flex rounded font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Conferir fonte oficial (abre em nova aba)
                </a>
              )}
              {answer.consultedAt && (
                <p>Fonte consultada em <time dateTime={answer.consultedAt}>{new Date(answer.consultedAt).toLocaleString('pt-BR')}</time>. Esse horário não indica a última atualização do evento.</p>
              )}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
