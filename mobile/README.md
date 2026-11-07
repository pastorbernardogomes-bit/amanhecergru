# RAFAH nativo — entrega 1 de 3

Aplicação independente em React Native, Expo, TypeScript e Expo Router. Não usa WebView. Os componentes e funções anteriores do repositório permanecem intactos. NativeWind aplica Tailwind aos componentes nativos; os tokens visuais estão em `tailwind.config.cjs`.

## Escopo funcional entregue

- Página inicial e rota `/igreja/[identifier]`, com slug ou UUID de `churches`.
- Deep links `rafah:///igreja/<slug-ou-uuid>`; leitura de links colados e abertura de QR Codes pela câmera do sistema, sem solicitar câmera no app.
- Boas-vindas, logo e cor decorativa por igreja. O texto mantém contraste fixo, independentemente da cor cadastrada.
- Consultas públicas a `churches`, `cultos` e `agenda_eventos`, sempre filtradas por `is_public` e pela igreja correta.
- Até 30 próximos cultos e 30 próximos eventos, ordenados por início. Horários apresentados no fuso do dispositivo.
- Localização por endereço, contatos e site público, sem coletar geolocalização.
- Carregamento, timeout, cancelamento ao sair, erro de rede, tentativa manual e estados vazios. Nenhuma lista privada ou cache persistente é criado.
- Interface web equivalente, sem login obrigatório, exportável para hospedagem pública.

Não há autenticação nem check-in nesta fase. O texto na lista de cultos informa explicitamente essa indisponibilidade; não há confirmação fictícia nem gravação anônima de presença.

## Desenvolvimento

A partir da pasta `mobile`:

1. Instalar dependências com `npm install` e versionar o lockfile gerado após validação.
2. Copiar `.env.example` para `.env` e preencher com a URL e a chave pública do mesmo Supabase utilizado pela plataforma web. Não criar outro backend.
3. Executar `npm start`, `npm run android`, `npm run ios` ou `npm run web`.
4. Executar `npm run typecheck` e `npm test`.

O SDK adotado é o Expo 52. Conferir a compatibilidade das dependências com `npx expo-doctor` e `npx expo install --check` antes do primeiro build e revisar os requisitos de SDK vigentes das lojas antes da entrega final. Nenhum desses comandos foi executado nesta entrega.

## Variáveis

- `EXPO_PUBLIC_SUPABASE_URL`: URL pública do backend compartilhado.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: chave anon/pública do mesmo projeto, sujeita a RLS. Nunca service_role.
- `EXPO_PUBLIC_WEB_URL`: origem HTTPS definitiva da alternativa pública, sem caminho, query ou fragmento.
- `RAFAH_IOS_BUNDLE_ID`: identificador iOS pertencente à organização.
- `RAFAH_ANDROID_PACKAGE`: identificador Android pertencente à organização.
- `EAS_PROJECT_ID`: ID real do projeto EAS.

Variáveis `EXPO_PUBLIC_*` ficam no aplicativo distribuído e não são segredos. Definir os mesmos valores públicos também nos ambientes EAS `development` e `production`. Credenciais de assinatura ficam no gerenciamento de credenciais EAS, nunca em arquivos versionados. Nenhuma chave do AI Gateway é necessária para este módulo.

O cliente em `src/lib/supabase.ts` é exclusivo do pacote nativo e aponta para o banco compartilhado. A fase pública desativa persistência de sessão. A implementação posterior de contas deve substituir essa política por armazenamento seguro e ciclo de sessão apropriado, sem criar um segundo sistema de autenticação.

## RLS e isolamento

Não foram criadas ou alteradas políticas SQL. O aplicativo usa a chave pública e respeita as permissões reais do Supabase. Filtros na interface não substituem RLS. Antes de publicar, verificar com sessão anônima que somente igrejas públicas e encontros públicos das respectivas igrejas podem ser lidos, inclusive por consultas diretas fora do app. Nenhuma tabela privada deve ficar acessível por causa desta entrega.

A estrutura fornecida não inclui as políticas efetivas: sua existência e isolamento ainda precisam ser verificados. Uma resposta vazia pode significar conteúdo não publicado ou acesso negado por políticas; o aplicativo não tenta contornar essa restrição.

## Web pública e QR Codes

Executar `npm run export:web` e publicar `dist` em uma origem HTTPS. Configurar a hospedagem para servir `index.html` em rotas de aplicação, incluindo `/igreja/*`, preservando arquivos estáticos reais e `/.well-known/*`. A exportação é uma aplicação Expo Router/React, não uma substituição estática do projeto existente.

Os QR Codes definitivos devem conter `https://SEU-DOMINIO/igreja/<slug-ou-uuid>`, não apenas o esquema `rafah:`. Assim, sem app instalado, a pessoa recebe a página pública. A página permite continuar sem instalação e oferece abertura manual no app já instalado. O botão não afirma que o app está instalado nem redireciona para lojas ainda não definidas.

O domínio deve pertencer à organização. `EXPO_PUBLIC_WEB_URL` ativa os entitlements/intent filters, mas isso sozinho não verifica o domínio:

- iOS: servir `/.well-known/apple-app-site-association` como JSON, sem redirecionamento, com o Team ID e bundle ID reais e autorização para `/igreja/*`.
- Android: servir `/.well-known/assetlinks.json` como JSON, sem redirecionamento, com package real e impressões SHA-256 corretas. Incluir a assinatura do Google Play App Signing para distribuição pela loja, não somente a assinatura de upload.
- Publicar os arquivos, reconstruir os apps após alteração do domínio e testar em instalação real, com app aberto, fechado e ausente.

Esses arquivos não foram preenchidos com identificadores inventados. Enquanto não forem publicados e verificados, os links HTTPS abrem a web; o esquema `rafah:` é o deep link nativo disponível em builds instalados. O Expo Go usa URLs de desenvolvimento próprias.

## EAS

`eas.json` inclui distribuição interna Android APK/iOS em aparelho, perfil de simulador iOS e produção Android AAB/iOS. O perfil `development` é um aplicativo interno completo, não um development client com servidor Metro. O build iOS em aparelho requer provisionamento válido.

Após vincular o projeto EAS e definir os identificadores reais:

- `eas build --profile development --platform android`
- `eas build --profile development --platform ios`
- `eas build --profile simulator --platform ios`
- `eas build --profile production --platform all`

A configuração não envia automaticamente para as lojas. Ícone, splash, screenshots, identificação comercial e metadados definitivos ainda não foram fornecidos.

## Testes e critérios de aceitação

Os testes automatizados entregues verificam identificação por slug/UUID, deep links, origem autorizada, rejeição de links malformados e criação de URL pública. Não substituem testes de interface, integração com Supabase ou testes RLS. Não foram executados.

Validar antes de liberar:

- Android e iOS reais: abertura fria/quente de deep links e QR HTTPS.
- Web sem app: navegação direta em `/igreja/<slug>`, atualização da página e permanência sem cadastro.
- Igreja pública válida, inexistente, privada, UUID, slug e tentativa de trocar igreja em consultas diretas.
- Igreja sem logo, endereço ou agenda, links HTTPS inválidos e conteúdo longo.
- Modo avião, timeout, tentativa novamente e troca de rota durante carregamento.
- VoiceOver/TalkBack, ordem de foco, zoom de texto, teclado web, contraste e alvos de toque.
- Fuso horário e datas de eventos em dispositivos com configurações diferentes.

## Próximas entregas

### Parte 2 — contas e presença

Usar exclusivamente `signUp`, `signInWithPassword`, `getSession`, `onAuthStateChange` e `signOut`. O perfil utiliza `user_profiles.id = session.user.id`, com `nome` e `avatar_url`. Após cadastro com sessão, gravar o perfil; quando confirmação de e-mail impedir sessão imediata, concluir a gravação após confirmação/login, respeitando RLS e sem usar service_role no dispositivo. Tratar recuperação, expiração, logout e armazenamento seguro.

Usar `church_memberships` para vínculo e autorização; nunca permitir que o dispositivo se atribua papel admin. Implementar check-in com `church_id`, `culto_id`, `user_id` e status inicial `pending`, sem promover o próprio registro a `confirmed`. Validar regras efetivas do banco, vínculo necessário, unicidade e concorrência antes de implementar repetição offline. Mostrar histórico somente do usuário autorizado. Sem fila persistente de dados pessoais por padrão.

### Parte 3 — módulos adicionais e produção

A estrutura atual não tem tabelas/colunas para escalas, visitantes, inscrições separadas, pedidos de oração, Pix/dados bancários, tokens de push ou preferências. Esses recursos precisam de contratos de dados e RLS específicos antes de qualquer consulta/gravação. Não reutilizar `check_ins` como inscrição nem inventar campos em `churches`.

Depois dos contratos: notificações com consentimento contextual e revogação, privacidade e comunicação, links externos autorizados e contribuições sem armazenar credenciais bancárias do usuário. Completar testes automatizados de conta, perfil, presença e autorização, além dos testes em dispositivos.

Antes das lojas: política pública de privacidade, responsável/controlador e contato, exclusão de conta e dados, declaração App Privacy/Data Safety consistente com SDKs e links externos, descrição das permissões, classificação etária, URLs de suporte, contas de revisão quando necessárias, imagens oficiais, assinatura e validação dos SDKs mínimos exigidos. Reavaliar a declaração de criptografia ao adicionar bibliotecas. Sem afirmar testes, aprovação ou publicação que ainda não ocorreram.
