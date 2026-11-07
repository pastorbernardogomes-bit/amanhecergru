export type ChurchIdentity = { field: 'id' | 'slug'; value: string };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function churchIdentity(value: string): ChurchIdentity | null {
  if (uuid.test(value)) return { field: 'id', value: value.toLowerCase() };
  if (value.length <= 200 && slug.test(value)) return { field: 'slug', value };
  return null;
}

export function publicOrigin(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && url.pathname === '/' && !url.search && !url.hash
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

export function parseChurchInput(input: string, webUrl?: string): string | null {
  const text = input.trim();
  const identity = churchIdentity(text);
  if (identity) return identity.value;
  try {
    const url = new URL(text);
    if (url.username || url.password || url.port || url.search || url.hash) return null;
    let path: string;
    if (url.protocol === 'rafah:') {
      if (url.hostname && url.hostname !== 'igreja') return null;
      path = url.hostname === 'igreja' ? `/igreja${url.pathname}` : url.pathname;
    } else {
      const origin = publicOrigin(webUrl);
      if (!origin || url.protocol !== 'https:' || url.origin !== origin) return null;
      path = url.pathname;
    }
    const match = /^\/igreja\/([^/]+)\/?$/.exec(path);
    if (!match) return null;
    return churchIdentity(decodeURIComponent(match[1]))?.value ?? null;
  } catch {
    return null;
  }
}

export function publicChurchUrl(identifier: string, webUrl?: string): string | null {
  const origin = publicOrigin(webUrl);
  const identity = churchIdentity(identifier);
  return origin && identity ? `${origin}/igreja/${encodeURIComponent(identity.value)}` : null;
}

export function safeHttpsUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
