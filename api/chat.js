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

  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'NVIDIA_API_KEY environment variable is not configured.' });
  }

  const {
    model = 'z-ai/glm-5.3',
    messages = [],
    temperature = 0.7,
    max_tokens = 2048,
  } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  let up;
  try {
    up = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        top_p: 1,
        max_tokens,
        stream: true,
      }),
    });
  } catch (err) {
    return res.status(502).json({ error: `Upstream request failed: ${err.message}` });
  }

  if (!up.ok || !up.body) {
    const text = await up.text().catch(() => '');
    return res
      .status(502)
      .json({ error: `Upstream error ${up.status}: ${text.slice(0, 500) || up.statusText}` });
  }

  res.writeHead(200, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
  });

  try {
    const reader = up.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let sep = buffer.indexOf('\n\n');
      while (sep !== -1) {
        const event = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        for (const line of event.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const obj = JSON.parse(data);
            const piece =
              obj.choices?.[0]?.delta?.content ??
              obj.choices?.[0]?.message?.content ??
              obj.output_text ??
              '';
            if (piece) res.write(piece);
          } catch {
            /* skip malformed event */
          }
        }
        sep = buffer.indexOf('\n\n');
      }
    }
  } finally {
    try {
      res.end();
    } catch {
      /* client may have disconnected */
    }
  }
}