import { supabase } from '@/lib/supabase'

export async function getMinVersion(platform: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_min_versions')
    .select('min_version')
    .eq('platform', platform)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data?.min_version ?? null;
}
