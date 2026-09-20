import { useEffect, useRef, useState } from 'react';
import { MODELS, VISION_MODEL_ID } from '../data';
import type { Model } from '../types';

interface ComposerProps {
  model: Model;
  onModelChange: (model: Model) => void;
  onSend: (text: string, image?: string) => void;
  onStop: () => void;
  streaming: boolean;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB keeps the request under Vercel's body limit
const MAX_TEXT_BYTES = 60 * 1024;

export default function Composer({
  model,
  onModelChange,
  onSend,
  onStop,
  streaming,
}: ComposerProps) {
  const [value, setValue] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!streaming) textareaRef.current?.focus();
  }, [streaming]);

  const submit = () => {
    const text = value.trim();
    if (streaming || (!text && !image)) return;
    onSend(text, image ?? undefined);
    setValue('');
    setImage(null);
    setMenuOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      if (file.size > MAX_IMAGE_BYTES) {
        setValue((v) => (v ? `${v}\n\n⚠ Image too large (max ${MAX_IMAGE_BYTES / 1024 / 1024}MB).` : `⚠ Image too large (max ${MAX_IMAGE_BYTES / 1024 / 1024}MB).`));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setImage(dataUrl);
        if (model.id !== VISION_MODEL_ID) {
          const vision = MODELS.find((m) => m.id === VISION_MODEL_ID);
          if (vision) onModelChange(vision);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    if (file.size > MAX_TEXT_BYTES) {
      setValue((v) =>
        v ? `${v}\n\n⚠ ${file.name} too large to attach (max ${MAX_TEXT_BYTES / 1024}KB).` : `⚠ ${file.name} too large to attach (max ${MAX_TEXT_BYTES / 1024}KB).`,
      );
      return;
    }
    const text = await file.text();
    const snippet = file.name.endsWith('.pdf') ? '' : text;
    const block = snippet.trim()
      ? `[Attached file: ${file.name}]\n\n${snippet}`
      : `[Attached file: ${file.name}] (binary — could not read contents)`;
    setValue((v) => (v ? `${v}\n\n${block}` : block));
    textareaRef.current?.focus();
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        setRecording(false);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (blob.size === 0) return;
        setTranscribing(true);
        try {
          const form = new FormData();
          form.append('file', blob, 'voice.webm');
          const r = await fetch('/api/transcribe', { method: 'POST', body: form });
          const data = await r.json().catch(() => ({}));
          if (r.ok && data.text) {
            setValue((v) => (v.trim() ? `${v} ${data.text}` : data.text));
          } else {
            setValue((v) => (v ? `${v}\n\n⚠ ${data.error ?? 'Transcription failed.'}` : `⚠ ${data.error ?? 'Transcription failed.'}`));
          }
        } catch {
          setValue((v) => `${v ? `${v}\n\n` : ''}⚠ Transcription failed.`);
        } finally {
          setTranscribing(false);
          textareaRef.current?.focus();
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setValue((v) => `${v ? `${v}\n\n` : ''}⚠ Microphone access denied.`);
    }
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else void startRecording();
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 transition-all duration-200 focus-within:border-brand-400/70 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.15)] dark:border-zinc-700/70 dark:bg-zinc-900">
        {image && (
          <div className="mb-2 flex animate-fade-up items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/60">
            <img src={image} alt="Attachment preview" className="h-14 w-14 rounded-lg object-cover" />
            <span className="min-w-0 flex-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
              Image attached — analyzed by Qwen 3.8 (vision)
            </span>
            <button
              onClick={() => setImage(null)}
              aria-label="Remove attachment"
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              <i className="ri-close-line text-base" />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            recording ? 'Recording… speak now' : transcribing ? 'Transcribing…' : 'Message Lumen…'
          }
          className="block max-h-[200px] w-full resize-none bg-transparent px-2 py-1 text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />

        <div className="mt-1 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Attach file"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-all duration-150 hover:bg-zinc-100 active:scale-90 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <i className="ri-attachment-2 text-lg" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.txt,.md,.json,.js,.ts,.tsx,.py,.html,.css,.csv,.log,.xml,.yaml,.yml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = '';
              }}
            />
            <button
              onClick={toggleRecording}
              aria-label={recording ? 'Stop recording' : 'Voice input'}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-all duration-150 active:scale-90 ${
                recording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <i className={`${recording ? 'ri-mic-fill' : transcribing ? 'ri-loader-4-line animate-spin' : 'ri-mic-line'} text-lg`} />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-sm font-medium text-zinc-600 transition-all duration-150 hover:bg-zinc-100 active:scale-95 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {model.name}
                <i className="ri-arrow-down-s-line text-base" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute bottom-11 left-0 z-20 w-56 origin-bottom-left animate-pop-in overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onModelChange(m);
                          setMenuOpen(false);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      >
                        <span>{m.name}</span>
                        {m.badge && (
                          <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                            {m.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {streaming ? (
            <button
              onClick={onStop}
              aria-label="Stop generating"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-zinc-800 text-white transition-all duration-150 hover:bg-zinc-700 active:scale-90 dark:bg-zinc-200 dark:text-zinc-900"
            >
              <i className="ri-stop-fill text-base" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={(!value.trim() && !image) || streaming}
              aria-label="Send message"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-brand-500 text-white transition-all duration-150 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <i className="ri-arrow-up-line text-lg" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-zinc-400">
        Lumen can make mistakes. Verify important information.
      </p>
    </div>
  );
}