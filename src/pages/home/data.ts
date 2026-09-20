import type { Agent, Conversation, Message, Model, Project, Provider, Settings } from './types';

export const MODELS: Model[] = [
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', badge: 'Groq' },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', badge: 'Groq' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', badge: 'Groq' },
  { id: 'z-ai/glm-5.3', name: 'GLM-5.3', badge: 'NVIDIA' },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    title: 'Quantum computing, simply explained',
    group: 'Today',
    preview: 'Think of a qubit like a coin mid-flip…',
    pinned: true,
  },
  {
    id: 'c2',
    title: 'Launch copy for the new landing page',
    group: 'Today',
    preview: 'Here are three headline directions…',
  },
  {
    id: 'c3',
    title: 'Why does my useEffect run twice?',
    group: 'Today',
    preview: 'React 18 StrictMode mounts twice in dev…',
  },
  {
    id: 'c4',
    title: '5-day Kyoto itinerary for autumn',
    group: 'Yesterday',
    preview: 'Day one: land at KIX, head to Gion…',
  },
  {
    id: 'c5',
    title: 'Cold email to seed investors',
    group: 'Yesterday',
    preview: 'Subject: a 1-line intro that earns the open…',
  },
  {
    id: 'c6',
    title: 'Rewrite this SQL join more efficiently',
    group: 'Yesterday',
    preview: 'The nested subquery is the bottleneck…',
  },
  {
    id: 'c7',
    title: 'Name ideas for a specialty coffee brand',
    group: 'Previous 7 days',
    preview: 'Ember, Marlowe, Driftwood, Halcyon…',
  },
  {
    id: 'c8',
    title: 'Summarize this 40-page PDF',
    group: 'Previous 7 days',
    preview: 'Five key findings, ranked by impact…',
  },
  {
    id: 'c9',
    title: 'Pitch deck outline for a Series A',
    group: 'Previous 7 days',
    preview: 'Slide 1 — the problem in one sentence…',
  },
];

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'Q4 Marketing Site', icon: 'ri-layout-masonry-line', count: 12 },
  { id: 'p2', name: 'Research: LLM Agents', icon: 'ri-flask-line', count: 7 },
  { id: 'p3', name: 'Novel — Draft One', icon: 'ri-book-open-line', count: 4 },
];

export const SUGGESTIONS: { icon: string; title: string; subtitle: string }[] = [
  {
    icon: 'ri-lightbulb-line',
    title: 'Brainstorm ideas',
    subtitle: 'Generate angles for a product launch',
  },
  {
    icon: 'ri-code-s-slash-line',
    title: 'Write code',
    subtitle: 'Build a debounce hook in TypeScript',
  },
  {
    icon: 'ri-book-open-line',
    title: 'Explain a concept',
    subtitle: 'Break down how transformers work',
  },
  {
    icon: 'ri-translate-2',
    title: 'Rewrite & polish',
    subtitle: 'Make an email sound more confident',
  },
];

export const SEED_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      id: 'm1',
      role: 'user',
      content: 'Explain quantum computing simply, but make it actually useful.',
    },
    {
      id: 'm2',
      role: 'assistant',
      content:
        'Think of a regular bit as a light switch — it is either off (0) or on (1). A qubit is more like a coin spinning in the air: while it spins, it is kind of both heads and tails at once. That "both at once" state is called superposition.\n\nWhy that matters: when you have many qubits, they can explore many possible answers simultaneously. A clever algorithm then nudges the wrong answers to cancel out and the right answer to reinforce itself — like tuning a radio until only one station comes through clearly.\n\nThe useful part today is narrow but real: simulating molecules for drug discovery, optimizing huge logistics routes, and certain kinds of cryptography. It is not a faster laptop — it is a different tool for specific problems that overwhelm normal computers.',
    },
  ],
  c3: [
    {
      id: 'm1',
      role: 'user',
      content: 'My useEffect runs twice in development. Is something broken?',
    },
    {
      id: 'm2',
      role: 'assistant',
      content:
        'Nothing is broken — that is React 18 StrictMode doing its job in development only. It intentionally mounts, unmounts, and remounts your components once to surface bugs where cleanup is missing.\n\nSo if you fetch data in an effect, make sure you either abort it or ignore the result after cleanup. A clean pattern:\n\nuseEffect(() => {\n  const controller = new AbortController();\n  fetch(url, { signal: controller.signal }).then(setData).catch(() => {});\n  return () => controller.abort();\n}, [url]);\n\nIn production builds it runs once, so do not "fix" it by adding guards — fix the missing cleanup instead.',
    },
  ],
};

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'a1',
    name: 'Code Reviewer',
    description: 'Reviews your code for bugs, security, and readability.',
    systemPrompt:
      'You are an expert senior software engineer and code reviewer. Review the code the user provides for bugs, security issues, performance problems, and readability. Give concrete, actionable suggestions with code examples. Be direct but encouraging.',
    emoji: '🧑‍💻',
    model: 'gpt-4o',
    temperature: 0.3,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'a2',
    name: 'Copywriter',
    description: 'Writes punchy marketing copy, emails, and headlines.',
    systemPrompt:
      'You are an elite copywriter. Write concise, compelling copy that converts. Vary tone to match the audience, avoid clichés, and always offer multiple options. Lead with a strong hook.',
    emoji: '✍️',
    model: 'gpt-4o',
    temperature: 0.8,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'a3',
    name: 'Fitness Coach',
    description: 'Builds workout plans and answers nutrition questions.',
    systemPrompt:
      'You are a certified personal trainer and nutrition coach. Create safe, effective workout and nutrition plans tailored to the user\'s goals and experience level. Always include a disclaimer to consult a professional for medical advice.',
    emoji: '💪',
    model: 'gpt-4o-mini',
    temperature: 0.6,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'a4',
    name: 'Tutor',
    description: 'Explains any topic patiently, step by step.',
    systemPrompt:
      'You are a patient, encouraging tutor. Explain concepts step by step, check the user\'s understanding with questions, and adapt your explanations to their level. Never just give the answer — teach them how to get there.',
    emoji: '🎓',
    model: 'gpt-4o',
    temperature: 0.7,
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  },
];

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  defaultModel: 'openai/gpt-oss-20b',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt:
    'You are Lumen, a precise and friendly assistant. Be concise, cite sources, and ask clarifying questions when needed.',
  webSearch: true,
  vision: false,
  memory: true,
  codeRunner: false,
  voice: false,
  stream: true,
  sendOnEnter: true,
  autoTitle: true,
  showSuggestions: true,
  language: 'English',
  reasoningEffort: 'low',
};

export const DEFAULT_PROVIDERS: Provider[] = [
  { id: 'openai', name: 'OpenAI', icon: 'ri-sparkling-2-line', color: 'bg-emerald-500', apiKey: '', baseUrl: 'https://api.openai.com/v1', enabled: false, builtin: true },
  { id: 'anthropic', name: 'Anthropic', icon: 'ri-scales-3-line', color: 'bg-amber-500', apiKey: '', baseUrl: 'https://api.anthropic.com', enabled: false, builtin: true },
  { id: 'google', name: 'Google Gemini', icon: 'ri-sparkling-line', color: 'bg-rose-500', apiKey: '', baseUrl: 'https://generativelanguage.googleapis.com', enabled: false, builtin: true },
  { id: 'mistral', name: 'Mistral AI', icon: 'ri-windy-line', color: 'bg-lime-500', apiKey: '', baseUrl: 'https://api.mistral.ai/v1', enabled: false, builtin: true },
  { id: 'groq', name: 'Groq', icon: 'ri-flashlight-line', color: 'bg-orange-500', apiKey: '', baseUrl: 'https://api.groq.com/openai/v1', enabled: false, builtin: true },
  { id: 'openrouter', name: 'OpenRouter', icon: 'ri-route-line', color: 'bg-teal-500', apiKey: '', baseUrl: 'https://openrouter.ai/api/v1', enabled: false, builtin: true },
];