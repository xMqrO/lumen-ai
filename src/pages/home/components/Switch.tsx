interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

export default function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
        checked ? 'bg-brand-500' : 'bg-zinc-300 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}