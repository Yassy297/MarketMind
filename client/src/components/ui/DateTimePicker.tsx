import { useRef } from 'react';
import { Calendar, Clock } from 'lucide-react';
import cn from 'classnames';

type DateTimePickerProps = {
  id?: string;
  type: 'date' | 'time';
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
};

const DateTimePicker = ({ id, type, value, required, onChange }: DateTimePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    try {
      input.showPicker();
    } catch {
      input.click();
    }
  };

  const Icon = type === 'date' ? Calendar : Clock;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type={type}
        required={required}
        value={value}
        aria-label={type === 'date' ? 'Choose date' : 'Choose time'}
        onChange={(event) => onChange(event.target.value)}
        onClick={openPicker}
        className={cn(
          'w-full rounded-lg border border-white/8 bg-ink-900/80 px-3.5 py-2.5 pr-10 text-sm text-slate-100 outline-none transition',
          'focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20',
          '[color-scheme:dark] cursor-pointer'
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={openPicker}
        className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400"
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DateTimePicker;
