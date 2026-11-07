import { supabase } from './supabase';
import { churchIdentity } from './links';

export type Church = {
  id: string;
  slug: string;
  nome: string;
  descricao_publica: string | null;
  logo_url: string | null;
  cor_principal: string | null;
  endereco_publico: string | null;
  telefone_publico: string | null;
  email_publico: string | null;
  site_url: string | null;
};

export type PublicEvent = {
  id: string;
  church_id: string;
  titulo: string;
  descricao_publica: string | null;
  local_publico: string | null;
  inicio_em: string;
  fim_em: string | null;
};

export type PublicChurchData = {
  church: Church;
  services: PublicEvent[];
  events: PublicEvent[];
};

export async function loadPublicChurch(identifier: string, signal: AbortSignal): Promise<PublicChurchData> {
  const identity = churchIdentity(identifier);
  if (!identity) throw new Error('O identificador da igreja é inválido. Confira o link ou o código informado.');
  if (!supabase) throw new Error('O acesso às informações está indisponível nesta versão do aplicativo.');

  const { data: church, error } = await supabase
    .from('churches')
    .select('id,slug,nome,descricao_publica,logo_url,cor_principal,endereco_publico,telefone_publico,email_publico,site_url')
    .eq(identity.field, identity.value)
    .eq('is_public', true)
    .abortSignal(signal)
    .maybeSingle();

  if (error) throw new Error('Não foi possível consultar a igreja. Confira sua conexão e tente novamente.');
  if (!church) throw new Error('Igreja não encontrada ou sem informações públicas disponíveis.');

  const columns = 'id,church_id,titulo,descricao_publica,local_publico,inicio_em,fim_em';
  const now = new Date().toISOString();
  const [services, events] = await Promise.all([
    supabase.from('cultos').select(columns).eq('church_id', church.id)
      .eq('is_public', true).gte('inicio_em', now).order('inicio_em').limit(30).abortSignal(signal),
    supabase.from('agenda_eventos').select(columns).eq('church_id', church.id)
      .eq('is_public', true).gte('inicio_em', now).order('inicio_em').limit(30).abortSignal(signal),
  ]);
  if (services.error || events.error) {
    throw new Error('Não foi possível carregar os cultos e a agenda. Confira sua conexão e tente novamente.');
  }
  return { church, services: services.data ?? [], events: events.data ?? [] };
}
