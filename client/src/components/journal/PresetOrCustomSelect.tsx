import { useEffect, useId, useRef } from 'react';
import Input from '../ui/input';

const fieldClass =
  'w-full rounded-lg border border-white/8 bg-ink-900/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20';

type PresetOrCustomSelectProps = {
  id?: string;
  options: readonly string[];
  selected: string;
  custom: string;
  customLabel: string;
  onSelectedChange: (value: string) => void;
  onCustomChange: (value: string) => void;
};

const PresetOrCustomSelect = ({
  id,
  options,
  selected,
  custom,
  customLabel,
  onSelectedChange,
  onCustomChange
}: PresetOrCustomSelectProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const customId = `${selectId}-custom`;
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected === 'Custom') customRef.current?.focus();
  }, [selected]);

  return (
    <div className="space-y-2">
      <select
        id={selectId}
        className={fieldClass}
        value={selected}
        onChange={(event) => onSelectedChange(event.target.value)}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
        <option value="Custom">Custom</option>
      </select>
      {selected === 'Custom' ? (
        <Input
          ref={customRef}
          id={customId}
          value={custom}
          placeholder={customLabel}
          aria-label={customLabel}
          onChange={(event) => onCustomChange(event.target.value)}
        />
      ) : null}
    </div>
  );
};

export default PresetOrCustomSelect;
