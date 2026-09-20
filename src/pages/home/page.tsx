import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import Welcome from './components/Welcome';
import MessageList from './components/MessageList';
import Composer from './components/Composer';
import ToolsPanel from './components/ToolsPanel';
import Agents from './components/Agents';
import SettingsModal from './components/SettingsModal';
import { useTheme } from '@/hooks/useTheme';
import { DEFAULT_AGENTS, DEFAULT_SETTINGS, MODELS, PROJECTS, VISION_MODEL_ID } from './data';
import type { Agent, Conversation, Message, Model, Settings } from './types';

type View = 'chat' | 'agents';

function loadAgents(): Agent[] {
  try {
    const raw = window.localStorage.getItem('lumen_agents');
    if (raw) return JSON.parse(raw) as Agent[];
  } catch {
    /* ignore */
  }
  return DEFAULT_AGENTS;
}

function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem('lumen_settings');
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Settings>;
      if (saved.defaultModel !== 'openai/gpt-oss-20b') {
        saved.defaultModel = 'openai/gpt-oss-20b';
      }
      return { ...DEFAULT_SETTINGS, ...saved };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

export default function Home() {
  const { theme, toggle } = useTheme();
  const [view, setView] = useState<View>('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [model, setModel] = useState<Model>(MODELS[0]);
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>(loadAgents);
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? conversations[0];
  const activeMessages = messages[activeId] ?? [];

  // Persist agents + settings
  useEffect(() => {
    window.localStorage.setItem('lumen_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    window.localStorage.setItem('lumen_settings', JSON.stringify(settings));
  }, [settings]);

  // Sync model + theme with settings
  useEffect(() => {
    const m = MODELS.find((x) => x.id === settings.defaultModel);
    if (m) setModel(m);
  }, [settings.defaultModel]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  const stop = () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;
    setStreaming(false);
  };

  const handleSelect = (id: string) => {
    stop();
    setActiveId(id);
    setView('chat');
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    stop();
    const id = crypto.randomUUID();
    const convo: Conversation = {
      id,
      title: 'New chat',
      group: 'Today',
      preview: '',
    };
    setConversations((prev) => [convo, ...prev]);
    setMessages((prev) => ({ ...prev, [id]: [] }));
    setActiveId(id);
    setView('chat');
    setSidebarOpen(false);
  };

  const handleSend = (text: string, image?: string) => {
    let convoId = activeId;
    if (!convoId || !conversations.some((c) => c.id === convoId)) {
      convoId = crypto.randomUUID();
      const convo: Conversation = {
        id: convoId,
        title: 'New chat',
        group: 'Today',
        preview: '',
      };
      setConversations((prev) => [convo, ...prev]);
      setActiveId(convoId);
    }
    const isFirst = (messages[convoId]?.length ?? 0) === 0;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      ...(image ? { image } : {}),
    };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => ({
      ...prev,
      [convoId]: [
        ...(prev[convoId] ?? []),
        userMessage,
        { id: assistantId, role: 'assistant', content: '' },
      ],
    }));

    if (isFirst) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convoId
            ? {
                ...c,
                title: text.length > 46 ? `${text.slice(0, 46)}…` : text,
                preview: text,
              }
            : c,
        ),
      );
    }

    stop();

    type ApiPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };
    const buildContent = (c: string | undefined, img?: string): string | ApiPart[] => {
      if (!img) return c ?? '';
      const parts: ApiPart[] = [];
      if (c) parts.push({ type: 'text', text: c });
      parts.push({ type: 'image_url', image_url: { url: img } });
      return parts;
    };

    const history = messages[convoId] ?? [];
    const apiMessages: { role: string; content: string | ApiPart[] }[] = [
      { role: 'system', content: settings.systemPrompt },
      ...history
        .filter((m) => m.content || m.image)
        .map((m) => ({
          role: m.role as string,
          content: buildContent(m.content, m.image),
        })),
      { role: 'user', content: buildContent(text, image) },
    ];

    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);

    void (async () => {
      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            model: model.id,
            messages: apiMessages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            ...(settings.reasoningEffort !== 'auto'
              ? { reasoning_effort: settings.reasoningEffort }
              : {}),
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          const errText = await resp.text().catch(() => '');
          if (controller.signal.aborted) return;
          throw new Error(errText || `Request failed (${resp.status})`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let received = '';
        let reasoningAcc = '';
        let shown = 0;
        let ended = false;
        const paint = () => {
          setMessages((prev) => ({
            ...prev,
            [convoId]: (prev[convoId] ?? []).map((m) =>
              m.id === assistantId
                ? { ...m, content: received.slice(0, shown), reasoning: reasoningAcc }
                : m,
            ),
          }));
        };
        // Stream at arrival speed: every tick drains the backlog so the reply
        // paints continuously (letter-by-letter for slow streams, near-instant
        // for fast ones) without ever throttling the model's throughput.
        const typeTimer = window.setInterval(() => {
          if (ended) return;
          const pending = received.length - shown;
          if (pending <= 0) return;
          shown = Math.min(received.length, shown + Math.max(1, Math.ceil(pending / 3)));
          paint();
        }, 8);
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let nl = buffer.indexOf('\n');
            while (nl !== -1) {
              const line = buffer.slice(0, nl).trim();
              buffer = buffer.slice(nl + 1);
              if (line) {
                try {
                  const obj = JSON.parse(line);
                  if (obj.type === 'reasoning' && obj.text) reasoningAcc += obj.text;
                  else if (obj.type === 'content' && obj.text) received += obj.text;
                  else if (obj.type === 'error')
                    received += (received ? '\n\n' : '') + `⚠ ${obj.text}`;
                } catch {
                  /* skip malformed line */
                }
              }
              nl = buffer.indexOf('\n');
            }
          }
          ended = true;
        } finally {
          window.clearInterval(typeTimer);
          shown = received.length;
          if (received || reasoningAcc) paint();
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : 'Request failed';
        setMessages((prev) => ({
          ...prev,
          [convoId]: (prev[convoId] ?? []).map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content ? `${m.content}\n\n⚠ ${msg}` : `⚠ ${msg}` }
              : m,
          ),
        }));
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    })();
  };

  const handleUseAgent = (agent: Agent) => {
    const id = crypto.randomUUID();
    const convo: Conversation = {
      id,
      title: `${agent.emoji} ${agent.name}`,
      group: 'Today',
      preview: '',
    };
    const welcome: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Hi, I'm ${agent.name}. ${agent.description}`,
    };
    setConversations((prev) => [convo, ...prev]);
    setMessages((prev) => ({ ...prev, [id]: [welcome] }));
    setActiveId(id);
    setView('chat');
  };

  const handleOpenAgents = () => {
    setView('agents');
    setSidebarOpen(false);
  };

  const updateSettings = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  return (
    <div className="flex h-screen animate-fade-in overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar
        conversations={conversations}
        projects={PROJECTS}
        activeId={activeId}
        view={view}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
        onOpenAgents={handleOpenAgents}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={theme}
        onToggleTheme={toggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatHeader
            title={
              view === 'agents'
                ? 'Your agents'
                : activeConversation?.title ?? 'New chat'
            }
            modelName={model.name}
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            toolsOpen={toolsOpen}
            onToggleTools={() => setToolsOpen((o) => !o)}
          />

          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {view === 'agents' ? (
              <Agents
                agents={agents}
                onCreate={(a) => setAgents((prev) => [a, ...prev])}
                onUpdate={(a) =>
                  setAgents((prev) => prev.map((x) => (x.id === a.id ? a : x)))
                }
                onDelete={(id) => setAgents((prev) => prev.filter((x) => x.id !== id))}
                onUse={handleUseAgent}
              />
            ) : activeMessages.length > 0 ? (
              <MessageList messages={activeMessages} streaming={streaming} />
            ) : (
              <Welcome onPick={handleSend} />
            )}
          </div>

          {view === 'chat' && (
            <div className="shrink-0 border-t border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 md:px-6">
              <div className="mx-auto w-full max-w-3xl">
                <Composer
                  model={model}
                  onModelChange={setModel}
                  onSend={handleSend}
                  onStop={stop}
                  streaming={streaming}
                />
              </div>
            </div>
          )}
        </div>

        <ToolsPanel
          model={model}
          open={toolsOpen}
          onClose={() => setToolsOpen(false)}
        />
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={updateSettings}
      />
    </div>
  );
}