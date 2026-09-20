import type { Agent, Conversation, Message, Model, Project, Provider, Settings } from './types';

export const MODELS: Model[] = [
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', badge: 'Groq' },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', badge: 'Groq' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', badge: 'Groq' },
  { id: 'z-ai/glm-5.3', name: 'GLM-5.3', badge: 'NVIDIA' },
];

export const VISION_MODEL_ID = 'qwen/qwen3.8-27b';

export const CONVERSATIONS: Conversation[] = [];

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

export const SEED_MESSAGES: Record<string, Message[]> = {};

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