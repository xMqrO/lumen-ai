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

  const {
    model = 'z-ai/glm-5.3',
    messages = [],
    temperature = 0.7,
    max_tokens = 2048,
    reasoning_effort,
  } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const PROVIDERS = {
    cerebras: {
      base: 'https://api.cerebras.ai/v1/chat/completions',
      env: 'CEREBRAS_API_KEY',
      models: new Set([
        'llama3.1-8b',
        'llama3.1-70b',
        'llama-3.3-70b',
        'gpt-oss-120b',
        'gpt-oss-20b',
        'qwen-3.8-27b',
        'qwen-3-32b',
        'zai-glm-4.6',
        'zai-glm-4.7',
        'gemma-4-31b',
      ]),
    },
    groq: {
      base: 'https://api.groq.com/openai/v1/chat/completions',
      env: 'GROQ_API_KEY',
      models: new Set([
        'openai/gpt-oss-20b',
        'openai/gpt-oss-120b',
        'qwen/qwen3.8-27b',
        'groq/compound',
        'groq/compound-mini',
        'allam-2-7b',
      ]),
    },
    nvidia: {
      base: 'https://integrate.api.nvidia.com/v1/chat/completions',
      env: 'NVIDIA_API_KEY',
      models: null, // fallback for everything else
    },
  };

  let provider = Object.values(PROVIDERS).find((p) => p.models?.has(model)) || PROVIDERS.nvidia;
  const key = process.env[provider.env];
  if (!key) {
    return res.status(500).json({
      error: `${provider.env} environment variable is not configured.`,
    });
  }

  const payload = { model, messages, temperature, top_p: 1, max_tokens, stream: true };
  // Forward the reasoning knob only where the upstream understands it.
  if (
    reasoning_effort &&
    (provider === PROVIDERS.nvidia ||
      (model === 'openai/gpt-oss-20b' || model === 'openai/gpt-oss-120b' || model === 'gpt-oss-20b' || model === 'gpt-oss-120b'))
  ) {
    payload.reasoning_effort = reasoning_effort;
  }

  let up;
  try {
    up = await fetch(provider.base, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
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

  // NDJSON typed stream so the client can show "thinking" separately from the answer.
  res.writeHead(200, {
    'content-type': 'application/x-ndjson; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
  });

  const emit = (obj) => {
    try {
      res.write(JSON.stringify(obj) + '\n');
    } catch {
      /* client disconnected */
    }
  };

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
            if (obj.error) {
              emit({ type: 'error', text: obj.error.message || JSON.stringify(obj.error) });
              continue;
            }
            const delta = obj.choices?.[0]?.delta ?? {};
            const content = delta.content || delta.text || '';
            if (content) emit({ type: 'content', text: String(content) });
          } catch {
            /* skip malformed event */
          }
        }
        sep = buffer.indexOf('\n\n');
      }
    }
    emit({ type: 'done' });
  } finally {
    try {
      res.end();
    } catch {
      /* client may have disconnected */
    }
  }
}