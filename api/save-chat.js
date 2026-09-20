import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-methods', 'POST, OPTIONS');
    res.setHeader('access-control-allow-headers', 'content-type, authorization');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = {};
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(500).json({ error: 'Supabase is not configured on the server.' });
  }

  const { id, title, preview, messages = [] } = body;
  if (!id || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'id and messages array are required' });
  }

  const sb = createClient(url, key);
  const now = new Date().toISOString();

  const { error: convoErr } = await sb.from('conversations').upsert({
    id,
    title: typeof title === 'string' ? title : 'New chat',
    preview: typeof preview === 'string' ? preview : '',
    updated_at: now,
  });
  if (convoErr) {
    return res.status(500).json({
      error: convoErr.message,
      hint: convoErr.message.includes('does not exist')
        ? 'create the tables first (see the SQL editor snippet)'
        : undefined,
    });
  }

  const { error: delErr } = await sb.from('messages').delete().eq('conversation_id', id);
  if (delErr) {
    return res.status(500).json({ error: delErr.message });
  }

  const rows = messages.map((m) => ({
    id: m.id,
    conversation_id: id,
    role: String(m.role || 'assistant'),
    content: String(m.content ?? ''),
    image: m.image ?? null,
    reasoning: m.reasoning ?? null,
    created_at: m.created_at ?? now,
  }));

  if (rows.length > 0) {
    const { error: insErr } = await sb.from('messages').insert(rows);
    if (insErr) {
      return res.status(500).json({ error: insErr.message });
    }
  }

  return res.json({ ok: true });
}