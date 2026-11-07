import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { safeHttpsUrl } from './links';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Cliente exclusivo da aplicação nativa, apontando para o backend compartilhado.
// Esta fase pública não cria nem persiste sessões de usuário.
export const supabase = url && key && safeHttpsUrl(url)
  ? createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;
