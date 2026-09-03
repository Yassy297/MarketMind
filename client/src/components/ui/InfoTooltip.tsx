import { useEffect, useId, useRef, useState } from 'react';
import { Info } from 'lucide-react';

type InfoTooltipProps = {
  label: string;
  children: string;
};

const InfoTooltip = ({ label, children }: InfoTooltipProps) => {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const place = () => {
    const button = buttonRef.current;
    const tip = tipRef.current;
    if (!button || !tip) return;
    const rect = button.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    let left = rect.left;
    let top = rect.bottom + 8;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    if (left < 8) left = 8;
    if (top + height > window.innerHeight - 8) top = rect.top - height - 8;
    if (top < 8) top = 8;
    setCoords({ top, left });
    setReady(true);
  };

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    const frame = window.requestAnimationFrame(place);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (
        buttonRef.current?.contains(event.target as Node) ||
        tipRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  return (
    <span className="relative inline-flex align-middle">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/5 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
        aria-label={`About ${label}`}
        aria-expanded={open}
        aria-controls={tooltipId}
        onMouseEnter={() => {
          window.clearTimeout(closeTimer.current);
          setOpen(true);
        }}
        onMouseLeave={() => {
          closeTimer.current = window.setTimeout(() => setOpen(false), 160);
        }}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
        }}
        onClick={(event) => {
          event.preventDefault();
          setOpen((current) => !current);
        }}
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open ? (
        <div
          ref={tipRef}
          id={tooltipId}
          role="tooltip"
          style={{ top: coords.top, left: coords.left }}
          className={`fixed z-50 max-w-[260px] rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-xs leading-relaxed text-slate-200 shadow-card ${ready ? 'opacity-100' : 'opacity-0'}`}
          onMouseEnter={() => {
            window.clearTimeout(closeTimer.current);
            setOpen(true);
          }}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </span>
  );
};

export default InfoTooltip;
