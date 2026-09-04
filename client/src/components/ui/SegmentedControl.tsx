import cn from 'classnames';

type Option<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  name: string;
  value: T;
  options: readonly Option<T>[];
  legend: string;
  onChange: (value: T) => void;
};

const SegmentedControl = <T extends string>({
  name,
  value,
  options,
  legend,
  onChange
}: SegmentedControlProps<T>) => (
  <fieldset>
    <legend className="sr-only">{legend}</legend>
    <div
      role="radiogroup"
      aria-label={legend}
      className="inline-flex rounded-lg border border-line bg-background-secondary p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              'cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-medium transition',
              selected ? 'bg-surface text-fg shadow-card' : 'text-fg-secondary hover:text-fg'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              className="sr-only"
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  </fieldset>
);

export default SegmentedControl;
