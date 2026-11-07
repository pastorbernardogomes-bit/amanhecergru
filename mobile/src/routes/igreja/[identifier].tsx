import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Linking, Platform, Text, View } from 'react-native';
import { Button, Card, ErrorNotice, Loading, Screen } from '../../components/ui';
import { churchIdentity, publicChurchUrl, safeHttpsUrl } from '../../lib/links';
import { loadPublicChurch } from '../../lib/public-church';
import type { PublicChurchData, PublicEvent } from '../../lib/public-church';

type Tab = 'welcome' | 'services' | 'agenda';
type State = { identifier: string; data: PublicChurchData | null; error: string; loading: boolean };

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Horário indisponível' : date.toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });
}

function EventList({ items, services, openMap }: { items: PublicEvent[]; services: boolean; openMap: (address: string) => void }) {
  return (
    <View className="gap-4">
      <Text accessibilityRole="header" className="text-2xl font-bold text-foreground">{services ? 'Próximos cultos' : 'Agenda pública'}</Text>
      <Text className="text-sm leading-6 text-muted-foreground">Até 30 próximos encontros publicados. Horários no fuso do seu dispositivo.</Text>
      {items.length === 0 ? (
        <Card><Text className="text-base text-muted-foreground">Nenhum encontro futuro publicado neste momento.</Text></Card>
      ) : items.map((event) => (
        <Card key={event.id}>
          <Text accessibilityRole="header" className="text-xl font-semibold text-foreground">{event.titulo}</Text>
          <Text className="text-base font-medium text-primary">{dateLabel(event.inicio_em)}</Text>
          {event.fim_em ? <Text className="text-sm text-muted-foreground">Término: {dateLabel(event.fim_em)}</Text> : null}
          {event.descricao_publica ? <Text className="text-base leading-7 text-foreground">{event.descricao_publica}</Text> : null}
          {event.local_publico ? (
            <View className="gap-3">
              <Text className="text-base text-muted-foreground">{event.local_publico}</Text>
              <Button secondary title={`Ver local de ${event.titulo} no mapa`} onPress={() => openMap(event.local_publico!)} />
            </View>
          ) : null}
          {services ? <Text className="text-sm leading-6 text-muted-foreground">O check-in pelo aplicativo ainda não está disponível. Consulte a recepção para registrar sua presença.</Text> : null}
        </Card>
      ))}
    </View>
  );
}

export default function ChurchPage() {
  const params = useLocalSearchParams<{ identifier: string }>();
  const identifier = typeof params.identifier === 'string' ? params.identifier : '';
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState<Tab>('welcome');
  const [linkError, setLinkError] = useState('');
  const [state, setState] = useState<State>({ identifier: '', data: null, error: '', loading: true });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({ identifier, data: null, error: '', loading: true });
    setTab('welcome');
    setLinkError('');
    const timer = setTimeout(() => {
      if (active) {
        active = false;
        controller.abort();
        setState({ identifier, data: null, loading: false, error: 'A consulta demorou mais que o esperado. Confira sua conexão e tente novamente.' });
      }
    }, 15000);
    loadPublicChurch(identifier, controller.signal)
      .then((data) => { if (active) setState({ identifier, data, error: '', loading: false }); })
      .catch((error: unknown) => {
        if (active) setState({ identifier, data: null, loading: false, error: error instanceof Error ? error.message : 'Não foi possível carregar as informações. Tente novamente.' });
      })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [identifier, attempt]);

  async function openExternal(url: string) {
    setLinkError('');
    try { await Linking.openURL(url); }
    catch { setLinkError('Não foi possível abrir o link. Tente novamente ou consulte o endereço exibido.'); }
  }

  function openMap(address: string) {
    void openExternal(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  }

  const current = state.identifier === identifier;
  const data = current ? state.data : null;
  const church = data?.church;
  const logo = safeHttpsUrl(church?.logo_url ?? null);
  const site = safeHttpsUrl(church?.site_url ?? null);
  const accent = church?.cor_principal && /^#[0-9a-f]{6}$/i.test(church.cor_principal) ? church.cor_principal : '#164e63';
  const webLink = church ? publicChurchUrl(church.slug, process.env.EXPO_PUBLIC_WEB_URL) : null;

  return (
    <Screen>
      <Button secondary title="Escolher outra igreja" onPress={() => router.replace('/')} />
      {!current || state.loading ? <Loading /> : state.error ? <ErrorNotice message={state.error} retry={() => setAttempt((value) => value + 1)} /> : null}
      {church && data ? (
        <View className="gap-6">
          <View className="gap-3 rounded-2xl border border-border bg-card p-6" style={{ borderTopColor: accent, borderTopWidth: 6 }}>
            {logo ? <Image source={{ uri: logo }} accessibilityLabel={`Logo de ${church.nome}`} className="h-20 w-20 rounded-xl" resizeMode="contain" /> : null}
            <Text className="text-sm font-semibold uppercase tracking-widest text-primary">Bem-vindo à comunidade</Text>
            <Text accessibilityRole="header" className="text-3xl font-bold text-foreground">{church.nome}</Text>
            <Text className="text-sm text-muted-foreground">Informações públicas · sem cadastro</Text>
          </View>
          <View accessibilityRole="tablist" className="flex-row flex-wrap gap-2">
            {([{ value: 'welcome', label: 'Boas-vindas' }, { value: 'services', label: 'Cultos' }, { value: 'agenda', label: 'Agenda' }] as const).map((item) => (
              <Button key={item.value} title={item.value === tab ? `${item.label} · atual` : item.label} secondary={item.value !== tab} onPress={() => setTab(item.value)} />
            ))}
          </View>
          {tab === 'welcome' ? (
            <View className="gap-4">
              <Card>
                <Text accessibilityRole="header" className="text-xl font-semibold text-foreground">Um lugar para você</Text>
                <Text className="text-base leading-7 text-muted-foreground">{church.descricao_publica || 'Conheça os próximos encontros e participe da nossa comunidade.'}</Text>
              </Card>
              <Card>
                <Text accessibilityRole="header" className="text-xl font-semibold text-foreground">Localização e contato</Text>
                <Text className="text-base leading-7 text-muted-foreground">{church.endereco_publico || 'Endereço ainda não publicado.'}</Text>
                {church.endereco_publico ? <Button secondary title="Abrir localização no mapa" onPress={() => openMap(church.endereco_publico!)} /> : null}
                {church.telefone_publico ? <Text selectable className="text-base text-foreground">Telefone: {church.telefone_publico}</Text> : null}
                {church.email_publico ? <Text selectable className="text-base text-foreground">E-mail: {church.email_publico}</Text> : null}
                {site ? <Button secondary title="Visitar site oficial (link externo)" onPress={() => void openExternal(site)} /> : null}
                <Text className="text-sm leading-6 text-muted-foreground">Links de mapa e site abrem serviços externos. Sua localização não é solicitada pelo RAFAH.</Text>
              </Card>
              <Button title="Ver próximos cultos" onPress={() => setTab('services')} />
            </View>
          ) : <EventList items={tab === 'services' ? data.services : data.events} services={tab === 'services'} openMap={openMap} />}
          {linkError ? <ErrorNotice message={linkError} /> : null}
          {Platform.OS === 'web' && churchIdentity(identifier) ? (
            <Card>
              <Text className="text-base text-muted-foreground">Você pode continuar por aqui, sem instalar nada.</Text>
              <Button secondary title="Abrir no aplicativo, se instalado" onPress={() => void openExternal(`rafah:///igreja/${encodeURIComponent(identifier)}`)} />
            </Card>
          ) : webLink ? <Button secondary title="Abrir versão pública na web" onPress={() => void openExternal(webLink)} /> : null}
          <Button secondary title="Atualizar informações" onPress={() => setAttempt((value) => value + 1)} />
        </View>
      ) : null}
    </Screen>
  );
}
