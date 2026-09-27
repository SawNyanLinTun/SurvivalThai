import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isConfigured = Boolean(url && key);

export const supabase = isConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

// Edge Function errors carry the JSON body ({ error: 'code' }) in error.context.
export async function invokeFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let code = 'server_error';
    try {
      code = (await error.context.json()).error || code;
    } catch {
      // network error or non-JSON body
    }
    throw new Error(code);
  }
  return data;
}
