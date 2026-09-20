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

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'GROQ_API_KEY environment variable is not configured.' });
  }

  const ct = req.headers['content-type'] || '';
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(ct);
  if (!match) {
    return res.status(400).json({ error: 'multipart/form-data required' });
  }
  const boundary = (match[1] || match[2]).trim();

  const chunks = [];
  for await (const c of req) chunks.push(c);
  const buf = Buffer.concat(chunks);

  const delim = Buffer.from(`--${boundary}\r\n`);
  const headerSep = Buffer.from('\r\n\r\n');
  const partEnd = Buffer.from(`\r\n--${boundary}`);
  let pos = 0;
  let audio = null;
  while (true) {
    const start = buf.indexOf(delim, pos);
    if (start === -1) break;
    const body = start + delim.length;
    const hs = buf.indexOf(headerSep, body);
    if (hs === -1) break;
    const headers = buf.slice(body, hs).toString('utf8');
    const be = buf.indexOf(partEnd, hs + 4);
    if (be === -1) break;
    if (/name="file"/.test(headers)) {
      audio = buf.slice(hs + 4, be);
      break;
    }
    pos = be + partEnd.length;
  }

  if (!audio || audio.length === 0) {
    return res.status(400).json({ error: 'audio file field "file" is required' });
  }

  const form = new FormData();
  form.append('model', 'whisper-large-v3-turbo');
  form.append('file', new Blob([audio], { type: 'audio/webm' }), 'voice.webm');

  let up;
  try {
    up = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}` },
      body: form,
    });
  } catch (err) {
    return res.status(502).json({ error: `Upstream request failed: ${err.message}` });
  }

  const data = await up.json().catch(() => ({}));
  if (!up.ok || typeof data.text !== 'string') {
    return res
      .status(502)
      .json({ error: `Upstream error ${up.status}: ${JSON.stringify(data).slice(0, 300)}` });
  }

  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ text: data.text }));
}