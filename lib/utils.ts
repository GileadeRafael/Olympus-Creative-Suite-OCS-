import { supabase } from '../services/supabaseClient';

export const getPublicUrl = (filePath: string): string => {
  if (!filePath || filePath.startsWith('https://')) {
    return filePath;
  }
  
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  
  // Use a timestamp that updates on every function call to aggressively bust the cache.
  // This ensures the browser always fetches the latest version of the image,
  // resolving issues with stubborn caching.
  const cacheBuster = new Date().getTime();
  
  return `${data.publicUrl}?t=${cacheBuster}`;
};