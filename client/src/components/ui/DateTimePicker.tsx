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
          'mm-field cursor-pointer pr-10'
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={openPicker}
        className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-fg-secondary"
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DateTimePicker;
