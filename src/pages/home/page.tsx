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
import { CONVERSATIONS, DEFAULT_AGENTS, DEFAULT_SETTINGS, MODELS, PROJECTS, SEED_MESSAGES } from './data';
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
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

export default function Home() {
  const { theme, toggle } = useTheme();
  const [view, setView] = useState<View>('chat');
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>(CONVERSATIONS[0].id);
  const [messages, setMessages] = useState<Record<string, Message[]>>(SEED_MESSAGES);
  const [model, setModel] = useState<Model>(MODELS[0]);
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>(loadAgents);
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const timerRef = useRef<number | null>(null);
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
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
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

  const handleSend = (text: string) => {
    const isFirst = (messages[activeId]?.length ?? 0) === 0;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        userMessage,
        { id: assistantId, role: 'assistant', content: '' },
      ],
    }));

    if (isFirst) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                title: text.length > 46 ? `${text.slice(0, 46)}…` : text,
                preview: text,
              }
            : c,
        ),
      );
    }

    const reply =
      `Great question. Here's my take on "${text.trim()}" — this is a temporary placeholder so you can feel the streaming flow. ` +
      'Next we connect the real AI provider (key stored securely in your Backend, used only inside a secure function), and I will give you a genuinely useful answer here.';

    setStreaming(true);
    let i = 0;
    timerRef.current = window.setInterval(() => {
      i += 3;
      const partial = reply.slice(0, i);
      setMessages((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] ?? []).map((m) =>
          m.id === assistantId ? { ...m, content: partial } : m,
        ),
      }));
      if (i >= reply.length) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setStreaming(false);
      }
    }, 16);
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
    <div className="flex h-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
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