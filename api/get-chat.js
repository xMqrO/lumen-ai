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

  const id = String(req.url?.split('?')[1] || '')
    .split('&')
    .map((p) => p.split('='))
    .find(([k]) => k === 'id')?.[1];

  if (!id) {
    return res.status(400).json({ error: 'id query param is required' });
  }

  const sb = createClient(url, key);
  const { data, error } = await sb
    .from('messages')
    .select('id,role,content,image,reasoning,created_at')
    .eq('conversation_id', decodeURIComponent(id))
    .order('created_at', { ascending: true });

  if (error) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: 'tables not created yet', messages: [] });
    }
    return res.status(500).json({ error: error.message, messages: [] });
  }

  return res.json({
    messages: (data ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      image: m.image ?? undefined,
      reasoning: m.reasoning ?? undefined,
      createdAt: m.created_at,
    })),
  });
}