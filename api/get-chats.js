import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-methods', 'GET, OPTIONS');
    res.setHeader('access-control-allow-headers', 'content-type, authorization');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(500).json({ error: 'Supabase is not configured on the server.' });
  }

  const sb = createClient(url, key);
  const { data, error } = await sb
    .from('conversations')
    .select('id,title,preview,created_at,updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: 'tables not created yet', conversations: [] });
    }
    return res.status(500).json({ error: error.message, conversations: [] });
  }

  const today = new Date();
  const isSameDay = (iso) => {
    const d = new Date(iso);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  return res.json({
    conversations: (data ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      preview: c.preview,
      group: isSameDay(c.updated_at) ? 'Today' : 'Previous',
      updated_at: c.updated_at,
    })),
  });
}