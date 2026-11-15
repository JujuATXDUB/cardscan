/**
 * Connection details for the app's backend (Supabase).
 *
 * These two values are PUBLIC by design. The "anon" key only lets the app call
 * the backend; it cannot read secrets. The CardSight key never leaves the
 * server, so it is not in this file.
 *
 * Fill these in from Supabase: Project Settings -> API.
 */
export const SUPABASE_URL = 'https://ngoyvuffbdndbymcoesz.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_qRbkOOrnrIKtKZwx9QAaIw_QDhOkUzd';

export function isBackendConfigured(): boolean {
  return !SUPABASE_URL.includes('YOUR-PROJECT-REF') && !SUPABASE_ANON_KEY.startsWith('YOUR-');
}
