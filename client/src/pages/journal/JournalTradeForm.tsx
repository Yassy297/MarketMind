import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import DateTimePicker from '../../components/ui/DateTimePicker';
import InfoTooltip from '../../components/ui/InfoTooltip';
import JournalInstrumentSearch from '../../components/journal/JournalInstrumentSearch';
import PresetOrCustomSelect from '../../components/journal/PresetOrCustomSelect';
import {
  ASSET_CLASS_OPTIONS,
  EMOTION_OPTIONS,
  FIELD_HELP,
  MARKET_CONDITION_OPTIONS,
  MISTAKE_OPTIONS,
  SETUP_OPTIONS,
  STRATEGY_OPTIONS,
  TRADE_QUALITY_OPTIONS,
  persistPresetOrCustom,
  resolvePresetOrCustom,
  usesMarketSearch
} from '../../config/journal';
import { useMarketContext } from '../../context/MarketContext';
import {
  createJournalTrade,
  fetchJournalTrade,
  getJournalErrorMessage,
  invalidateJournalCaches,
  updateJournalTrade
} from '../../services/journal.service';
import type { CurrencyCode, MarketCode } from '../../config/markets';
import type { JournalAssetClass, JournalAssetDetails, JournalTradeInput } from '../../types/journal';
import { previewHoldingDuration } from '../../utils/holding-duration';

const fieldClass = 'mm-field';

const emptyForm = (currency: CurrencyCode, market: MarketCode | null): JournalTradeInput => ({
  symbol: '',
  displaySymbol: '',
  instrumentName: '',
  assetClass: 'equity',
  market: market ?? undefined,
  currency,
  direction: 'LONG',
  status: 'OPEN',
  entryPrice: 0,
  quantity: 1,
  entryDate: new Date().toISOString().slice(0, 10),
  fees: 0,
  mistakeTags: [],
  tags: [],
  assetDetails: {}
});

const numberOrUndefined = (value: string) => {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const Field = ({
  id,
  label,
  help,
  children
}: {
  id?: string;
  label: string;
  help?: string;
  children: ReactNode;
}) => (
  <div className="block text-sm text-fg-secondary">
    <div className="mb-1 flex items-center gap-1.5">
      <label htmlFor={id} className="text-sm text-fg-secondary">{label}</label>
      {help ? <InfoTooltip label={label}>{help}</InfoTooltip> : null}
    </div>
    {children}
  </div>
);

const JournalTradeForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency, market } = useMarketContext();
  const ids = {
    assetClass: useId(),
    instrument: useId(),
    direction: useId(),
    status: useId(),
    entryPrice: useId(),
    quantity: useId(),
    entryDate: useId(),
    entryTime: useId(),
    exitPrice: useId(),
    exitDate: useId(),
    exitTime: useId(),
    fees: useId(),
    stopLoss: useId(),
    target: useId(),
    currency: useId(),
    strategy: useId(),
    setup: useId(),
    marketCondition: useId(),
    entryReason: useId(),
    exitReason: useId(),
    thesis: useId(),
    executionNotes: useId(),
    confidence: useId(),
    tradeQuality: useId(),
    emotionBefore: useId(),
    emotionAfter: useId(),
    followedPlan: useId(),
    whatWentRight: useId(),
    whatWentWrong: useId(),
    lessonLearned: useId(),
    whatWouldDoDifferently: useId(),
    notes: useId()
  };
  const [form, setForm] = useState<JournalTradeInput>(() => emptyForm(currency ?? 'INR', market));
  const [error, setError] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [strategySelected, setStrategySelected] = useState('');
  const [strategyCustom, setStrategyCustom] = useState('');
  const [setupSelected, setSetupSelected] = useState('');
  const [setupCustom, setSetupCustom] = useState('');
  const [conditionSelected, setConditionSelected] = useState('');
  const [conditionCustom, setConditionCustom] = useState('');

  const existingQuery = useQuery({
    queryKey: ['journal-trade', id],
    queryFn: () => fetchJournalTrade(id!),
    enabled: Boolean(id),
    retry: false
  });

  useEffect(() => {
    if (!existingQuery.data) return;
    const trade = existingQuery.data;
    setForm({
      instrumentId: trade.instrumentId,
      symbol: trade.symbol,
      displaySymbol: trade.displaySymbol,
      instrumentName: trade.instrumentName,
      assetClass: trade.assetClass,
      market: trade.market,
      exchange: trade.exchange,
      currency: trade.currency,
      direction: trade.direction,
      status: trade.status,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice ?? undefined,
      quantity: trade.quantity,
      entryDate: trade.entryDate,
      entryTime: trade.entryTime,
      exitDate: trade.exitDate ?? undefined,
      exitTime: trade.exitTime,
      fees: trade.fees ?? 0,
      stopLoss: trade.stopLoss,
      target: trade.target,
      thesis: trade.thesis,
      entryReason: trade.entryReason,
      exitReason: trade.exitReason,
      strategy: trade.strategy,
      setup: trade.setup,
      marketCondition: trade.marketCondition,
      tradeQuality: trade.tradeQuality,
      executionNotes: trade.executionNotes,
      confidence: trade.confidence,
      emotionBefore: trade.emotionBefore,
      emotionAfter: trade.emotionAfter,
      followedPlan: trade.followedPlan,
      mistakeTags: trade.mistakeTags ?? [],
      lessonLearned: trade.lessonLearned,
      whatWentRight: trade.whatWentRight,
      whatWentWrong: trade.whatWentWrong,
      whatWouldDoDifferently: trade.whatWouldDoDifferently,
      notes: trade.notes,
      tags: trade.tags ?? [],
      attachments: trade.attachments,
      assetDetails: trade.assetDetails ?? {}
    });
    const strategy = resolvePresetOrCustom(trade.strategy, STRATEGY_OPTIONS);
    setStrategySelected(strategy.selected);
    setStrategyCustom(strategy.custom);
    const setup = resolvePresetOrCustom(trade.setup, SETUP_OPTIONS);
    setSetupSelected(setup.selected);
    setSetupCustom(setup.custom);
    const condition = resolvePresetOrCustom(trade.marketCondition, MARKET_CONDITION_OPTIONS);
    setConditionSelected(condition.selected);
    setConditionCustom(condition.custom);
  }, [existingQuery.data]);

  const mutation = useMutation({
    mutationFn: (payload: JournalTradeInput) =>
      isEdit ? updateJournalTrade(id!, payload) : createJournalTrade(payload),
    onSuccess: (trade) => {
      invalidateJournalCaches(queryClient, trade.id);
      navigate(`/journal/trades/${trade.id}`);
    },
    onError: (mutationError) => {
      setError(getJournalErrorMessage(mutationError, 'Unable to save the trade.'));
    }
  });

  const setField = <K extends keyof JournalTradeInput>(key: K, value: JournalTradeInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setDetails = (patch: JournalAssetDetails) => {
    setForm((current) => ({ ...current, assetDetails: { ...current.assetDetails, ...patch } }));
  };

  const details = form.assetDetails ?? {};
  const holdingPreview = previewHoldingDuration(form);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mutation.isPending) return;
    setError(null);
    if (!form.instrumentName.trim() && !form.symbol.trim()) {
      setError('Instrument name is required.');
      return;
    }
    if (strategySelected === 'Custom' && !strategyCustom.trim()) {
      setError('Enter a custom strategy or choose another option.');
      return;
    }
    if (setupSelected === 'Custom' && !setupCustom.trim()) {
      setError('Enter a custom setup or choose another option.');
      return;
    }
    if (conditionSelected === 'Custom' && !conditionCustom.trim()) {
      setError('Enter a custom market condition or choose another option.');
      return;
    }
    const symbol = form.symbol || form.displaySymbol || form.instrumentName;
    mutation.mutate({
      ...form,
      symbol,
      displaySymbol: form.displaySymbol || symbol,
      instrumentName: form.instrumentName || form.displaySymbol || symbol,
      strategy: persistPresetOrCustom(strategySelected, strategyCustom),
      setup: persistPresetOrCustom(setupSelected, setupCustom),
      marketCondition: persistPresetOrCustom(conditionSelected, conditionCustom),
      exitPrice: form.status === 'CLOSED' ? form.exitPrice : form.exitPrice ?? undefined,
      exitDate: form.status === 'CLOSED' ? form.exitDate : form.exitDate || undefined
    });
  };

  if (isEdit && existingQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-2xl bg-surface-hover" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-hover" />
      </div>
    );
  }

  if (isEdit && existingQuery.isError) {
    return (
      <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning" role="alert">
        {getJournalErrorMessage(existingQuery.error, 'Unable to load this trade.')}
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <PageHeader
        title={isEdit ? 'Edit trade' : 'Add trade'}
        subtitle="Record a trade you have already taken. This is not an order ticket."
      />

      {error ? (
        <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-warning" role="alert">
          {error}
        </div>
      ) : null}

      <section className="mm-card grid gap-4 md:grid-cols-2">
        <h3 className="text-section-title text-fg md:col-span-2">Trade details</h3>
        <Field id={ids.assetClass} label="Asset class" help={FIELD_HELP.assetClass}>
          <select id={ids.assetClass} className={fieldClass} value={form.assetClass} onChange={(event) => setField('assetClass', event.target.value as JournalAssetClass)}>
            {ASSET_CLASS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
        <Field id={ids.instrument} label="Instrument" help={FIELD_HELP.instrument}>
          {usesMarketSearch(form.assetClass) ? (
            <JournalInstrumentSearch
              id={ids.instrument}
              value={form.instrumentName || form.displaySymbol}
              onQueryChange={(value) => {
                setField('instrumentName', value);
                setField('displaySymbol', value);
                setField('symbol', value);
              }}
              onSelect={(result) => {
                setField('symbol', result.symbol);
                setField('displaySymbol', result.displaySymbol);
                setField('instrumentName', result.companyName);
                setField('exchange', result.exchange ?? undefined);
                setField('market', result.market ?? market ?? undefined);
                setField('currency', (result.currency ?? currency ?? form.currency) as JournalTradeInput['currency']);
                setField('instrumentId', result.isin ?? undefined);
              }}
            />
          ) : (
            <Input
              id={ids.instrument}
              value={form.instrumentName}
              onChange={(event) => {
                setField('instrumentName', event.target.value);
                setField('displaySymbol', event.target.value);
                setField('symbol', event.target.value);
              }}
            />
          )}
        </Field>
        <Field id={ids.direction} label="Direction" help={FIELD_HELP.direction}>
          <select id={ids.direction} className={fieldClass} value={form.direction} onChange={(event) => setField('direction', event.target.value as JournalTradeInput['direction'])}>
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
        </Field>
        <Field id={ids.status} label="Status" help={FIELD_HELP.status}>
          <select id={ids.status} className={fieldClass} value={form.status} onChange={(event) => setField('status', event.target.value as JournalTradeInput['status'])}>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
        </Field>
        <Field id={ids.entryPrice} label="Entry price / NAV" help={FIELD_HELP.entryPrice}>
          <Input id={ids.entryPrice} type="number" step="any" value={form.entryPrice || ''} onChange={(event) => setField('entryPrice', Number(event.target.value))} required />
        </Field>
        <Field id={ids.quantity} label="Quantity / units" help={FIELD_HELP.quantity}>
          <Input id={ids.quantity} type="number" step="any" value={form.quantity || ''} onChange={(event) => setField('quantity', Number(event.target.value))} required />
        </Field>
        <Field id={ids.entryDate} label="Entry date" help={FIELD_HELP.entryDate}>
          <DateTimePicker id={ids.entryDate} type="date" value={form.entryDate} onChange={(value) => setField('entryDate', value)} required />
        </Field>
        <Field id={ids.entryTime} label="Entry time" help={FIELD_HELP.entryTime}>
          <DateTimePicker id={ids.entryTime} type="time" value={form.entryTime ?? ''} onChange={(value) => setField('entryTime', value)} />
        </Field>
        {form.status === 'CLOSED' ? (
          <>
            <Field id={ids.exitPrice} label="Exit price / NAV" help={FIELD_HELP.exitPrice}>
              <Input id={ids.exitPrice} type="number" step="any" value={form.exitPrice ?? ''} onChange={(event) => setField('exitPrice', numberOrUndefined(event.target.value))} required />
            </Field>
            <Field id={ids.exitDate} label="Exit date" help={FIELD_HELP.exitDate}>
              <DateTimePicker id={ids.exitDate} type="date" value={form.exitDate ?? ''} onChange={(value) => setField('exitDate', value)} required />
            </Field>
            <Field id={ids.exitTime} label="Exit time" help={FIELD_HELP.exitTime}>
              <DateTimePicker id={ids.exitTime} type="time" value={form.exitTime ?? ''} onChange={(value) => setField('exitTime', value)} />
            </Field>
          </>
        ) : null}
        <Field id={ids.fees} label="Fees" help={FIELD_HELP.fees}>
          <Input id={ids.fees} type="number" step="any" value={form.fees ?? ''} onChange={(event) => setField('fees', numberOrUndefined(event.target.value) ?? 0)} />
        </Field>
        <Field id={ids.currency} label="Transaction currency" help={FIELD_HELP.currency}>
          <Input id={ids.currency} value={form.currency} readOnly />
        </Field>
        <Field label="Holding duration" help={FIELD_HELP.holdingDuration}>
          <Input value={holdingPreview} readOnly aria-readonly="true" />
        </Field>
        {form.assetClass === 'crypto' ? (
          <>
            <Field label="Exchange">
              <Input value={details.exchange ?? ''} onChange={(event) => setDetails({ exchange: event.target.value })} />
            </Field>
            <Field label="Pair">
              <Input value={details.pair ?? ''} onChange={(event) => setDetails({ pair: event.target.value })} />
            </Field>
          </>
        ) : null}
        {form.assetClass === 'mutual_fund' ? (
          <Field label="Fund">
            <Input value={details.fundName ?? form.instrumentName} onChange={(event) => setDetails({ fundName: event.target.value })} />
          </Field>
        ) : null}
        {form.assetClass === 'option' ? (
          <>
            <Field label="Underlying">
              <Input value={details.underlying ?? ''} onChange={(event) => setDetails({ underlying: event.target.value })} />
            </Field>
            <Field label="Call / Put">
              <select className={fieldClass} value={details.optionType ?? ''} onChange={(event) => setDetails({ optionType: event.target.value as 'call' | 'put' })}>
                <option value="">Select</option>
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </Field>
            <Field label="Strike">
              <Input value={details.strike ?? ''} onChange={(event) => setDetails({ strike: numberOrUndefined(event.target.value) })} />
            </Field>
            <Field label="Expiry">
              <Input value={details.expiry ?? ''} onChange={(event) => setDetails({ expiry: event.target.value })} />
            </Field>
            <Field label="Premium">
              <Input value={details.premium ?? ''} onChange={(event) => setDetails({ premium: numberOrUndefined(event.target.value) })} />
            </Field>
            <Field label="Lots">
              <Input value={details.lots ?? ''} onChange={(event) => setDetails({ lots: numberOrUndefined(event.target.value) })} />
            </Field>
          </>
        ) : null}
        {form.assetClass === 'future' || form.assetClass === 'commodity' ? (
          <>
            <Field label={form.assetClass === 'commodity' ? 'Commodity' : 'Underlying'}>
              <Input
                value={details.underlying ?? details.commodity ?? ''}
                onChange={(event) => setDetails({ underlying: event.target.value, commodity: event.target.value })}
              />
            </Field>
            <Field label="Contract">
              <Input value={details.contract ?? ''} onChange={(event) => setDetails({ contract: event.target.value })} />
            </Field>
            <Field label="Expiry">
              <Input value={details.expiry ?? ''} onChange={(event) => setDetails({ expiry: event.target.value })} />
            </Field>
            <Field label="Lot / contract size">
              <Input
                value={details.lotSize ?? details.contractSize ?? ''}
                onChange={(event) => setDetails({
                  lotSize: numberOrUndefined(event.target.value),
                  contractSize: numberOrUndefined(event.target.value)
                })}
              />
            </Field>
          </>
        ) : null}
        {form.assetClass === 'forex' ? (
          <Field label="Currency pair">
            <Input value={details.currencyPair ?? ''} onChange={(event) => setDetails({ currencyPair: event.target.value })} />
          </Field>
        ) : null}
        {form.assetClass === 'bond' ? (
          <>
            <Field label="Issuer">
              <Input value={details.issuer ?? ''} onChange={(event) => setDetails({ issuer: event.target.value })} />
            </Field>
            <Field label="Face value">
              <Input value={details.faceValue ?? ''} onChange={(event) => setDetails({ faceValue: numberOrUndefined(event.target.value) })} />
            </Field>
            <Field label="Coupon">
              <Input value={details.coupon ?? ''} onChange={(event) => setDetails({ coupon: numberOrUndefined(event.target.value) })} />
            </Field>
          </>
        ) : null}
        {form.assetClass === 'other' ? (
          <Field label="Custom instrument name">
            <Input value={details.customName ?? ''} onChange={(event) => setDetails({ customName: event.target.value })} />
          </Field>
        ) : null}
        {form.assetClass === 'equity' || form.assetClass === 'etf' || form.assetClass === 'reit' ? (
          <Field label="Exchange">
            <Input
              value={form.exchange ?? details.exchange ?? ''}
              onChange={(event) => {
                setField('exchange', event.target.value);
                setDetails({ exchange: event.target.value });
              }}
            />
          </Field>
        ) : null}
      </section>

      <section className="mm-card grid gap-4 md:grid-cols-2">
        <h3 className="text-section-title text-fg md:col-span-2">Risk</h3>
        <Field id={ids.stopLoss} label="Stop loss" help={FIELD_HELP.stopLoss}>
          <Input id={ids.stopLoss} type="number" step="any" value={form.stopLoss ?? ''} onChange={(event) => setField('stopLoss', numberOrUndefined(event.target.value) ?? null)} />
        </Field>
        <Field id={ids.target} label="Target" help={FIELD_HELP.target}>
          <Input id={ids.target} type="number" step="any" value={form.target ?? ''} onChange={(event) => setField('target', numberOrUndefined(event.target.value) ?? null)} />
        </Field>
      </section>

      <section className="mm-card grid gap-4 md:grid-cols-2">
        <h3 className="text-section-title text-fg md:col-span-2">Journal</h3>
        <Field id={ids.entryReason} label="Why did I enter?" help={FIELD_HELP.entryReason}>
          <textarea id={ids.entryReason} className={fieldClass} rows={3} value={form.entryReason ?? ''} onChange={(event) => setField('entryReason', event.target.value)} />
        </Field>
        <Field id={ids.exitReason} label="Why did I exit?" help={FIELD_HELP.exitReason}>
          <textarea id={ids.exitReason} className={fieldClass} rows={3} value={form.exitReason ?? ''} onChange={(event) => setField('exitReason', event.target.value)} />
        </Field>
        <Field id={ids.thesis} label="Trade thesis" help={FIELD_HELP.thesis}>
          <textarea id={ids.thesis} className={`${fieldClass} md:col-span-2`} rows={3} value={form.thesis ?? ''} onChange={(event) => setField('thesis', event.target.value)} />
        </Field>
        <Field id={ids.strategy} label="Strategy" help={FIELD_HELP.strategy}>
          <PresetOrCustomSelect
            id={ids.strategy}
            options={STRATEGY_OPTIONS}
            selected={strategySelected}
            custom={strategyCustom}
            customLabel="Custom strategy"
            onSelectedChange={setStrategySelected}
            onCustomChange={setStrategyCustom}
          />
        </Field>
        <Field id={ids.setup} label="Setup" help={FIELD_HELP.setup}>
          <PresetOrCustomSelect
            id={ids.setup}
            options={SETUP_OPTIONS}
            selected={setupSelected}
            custom={setupCustom}
            customLabel="Custom setup"
            onSelectedChange={setSetupSelected}
            onCustomChange={setSetupCustom}
          />
        </Field>
        <Field id={ids.marketCondition} label="Market condition" help={FIELD_HELP.marketCondition}>
          <PresetOrCustomSelect
            id={ids.marketCondition}
            options={MARKET_CONDITION_OPTIONS}
            selected={conditionSelected}
            custom={conditionCustom}
            customLabel="Custom market condition"
            onSelectedChange={setConditionSelected}
            onCustomChange={setConditionCustom}
          />
        </Field>
        <Field id={ids.executionNotes} label="Execution notes" help={FIELD_HELP.executionNotes}>
          <textarea id={ids.executionNotes} className={`${fieldClass} md:col-span-2`} rows={2} value={form.executionNotes ?? ''} onChange={(event) => setField('executionNotes', event.target.value)} />
        </Field>
      </section>

      <section className="mm-card grid gap-4 md:grid-cols-2">
        <h3 className="text-section-title text-fg md:col-span-2">Psychology</h3>
        <Field id={ids.confidence} label="Confidence" help={FIELD_HELP.confidence}>
          <Input id={ids.confidence} type="number" min={1} max={10} value={form.confidence ?? ''} onChange={(event) => setField('confidence', numberOrUndefined(event.target.value) ?? null)} />
        </Field>
        <Field id={ids.tradeQuality} label="Trade quality" help={FIELD_HELP.tradeQuality}>
          <select
            id={ids.tradeQuality}
            className={fieldClass}
            value={form.tradeQuality ?? ''}
            onChange={(event) => setField('tradeQuality', numberOrUndefined(event.target.value) ?? null)}
          >
            <option value="">Not rated</option>
            {TRADE_QUALITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
        <Field id={ids.emotionBefore} label="Emotion before" help={FIELD_HELP.emotionBefore}>
          <select id={ids.emotionBefore} className={fieldClass} value={form.emotionBefore ?? ''} onChange={(event) => setField('emotionBefore', event.target.value)}>
            <option value="">Select</option>
            {EMOTION_OPTIONS.map((emotion) => <option key={emotion} value={emotion}>{emotion}</option>)}
          </select>
        </Field>
        <Field id={ids.emotionAfter} label="Emotion after" help={FIELD_HELP.emotionAfter}>
          <select id={ids.emotionAfter} className={fieldClass} value={form.emotionAfter ?? ''} onChange={(event) => setField('emotionAfter', event.target.value)}>
            <option value="">Select</option>
            {EMOTION_OPTIONS.map((emotion) => <option key={emotion} value={emotion}>{emotion}</option>)}
          </select>
        </Field>
        <div className="flex items-center gap-2 text-sm text-fg-secondary">
          <input id={ids.followedPlan} type="checkbox" checked={form.followedPlan === true} onChange={(event) => setField('followedPlan', event.target.checked)} />
          <label htmlFor={ids.followedPlan}>I followed my plan</label>
          <InfoTooltip label="Followed my plan">{FIELD_HELP.followedPlan}</InfoTooltip>
        </div>
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center gap-1.5 text-sm text-fg-secondary">
            <span>Mistakes</span>
            <InfoTooltip label="Mistakes">{FIELD_HELP.mistakes}</InfoTooltip>
          </div>
          <div className="flex flex-wrap gap-2">
            {MISTAKE_OPTIONS.map((tag) => {
              const selected = form.mistakeTags?.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setField(
                      'mistakeTags',
                      selected ? form.mistakeTags?.filter((item) => item !== tag) : [...(form.mistakeTags ?? []), tag]
                    )
                  }
                  className={`rounded-full px-3 py-1 text-xs ${selected ? 'bg-violet-500/20 text-brand' : 'bg-surface-hover text-fg-secondary'}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mm-card grid gap-4 md:grid-cols-2">
        <h3 className="text-section-title text-fg md:col-span-2">Review</h3>
        <Field id={ids.whatWentRight} label="What went right?" help={FIELD_HELP.whatWentRight}>
          <textarea id={ids.whatWentRight} className={fieldClass} rows={2} value={form.whatWentRight ?? ''} onChange={(event) => setField('whatWentRight', event.target.value)} />
        </Field>
        <Field id={ids.whatWentWrong} label="What went wrong?" help={FIELD_HELP.whatWentWrong}>
          <textarea id={ids.whatWentWrong} className={fieldClass} rows={2} value={form.whatWentWrong ?? ''} onChange={(event) => setField('whatWentWrong', event.target.value)} />
        </Field>
        <Field id={ids.lessonLearned} label="Lesson learned" help={FIELD_HELP.lessonLearned}>
          <textarea id={ids.lessonLearned} className={fieldClass} rows={2} value={form.lessonLearned ?? ''} onChange={(event) => setField('lessonLearned', event.target.value)} />
        </Field>
        <Field id={ids.whatWouldDoDifferently} label="What would I do differently?" help={FIELD_HELP.whatWouldDoDifferently}>
          <textarea id={ids.whatWouldDoDifferently} className={fieldClass} rows={2} value={form.whatWouldDoDifferently ?? ''} onChange={(event) => setField('whatWouldDoDifferently', event.target.value)} />
        </Field>
        <Field id={ids.notes} label="Notes" help={FIELD_HELP.notes}>
          <textarea id={ids.notes} className={`${fieldClass} md:col-span-2`} rows={3} value={form.notes ?? ''} onChange={(event) => setField('notes', event.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <div className="mb-2 flex gap-2">
            <Input placeholder="Add tag" value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!tagDraft.trim()) return;
                setField('tags', [...new Set([...(form.tags ?? []), tagDraft.trim()])]);
                setTagDraft('');
              }}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.tags ?? []).map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full bg-surface-hover px-3 py-1 text-xs text-fg-secondary"
                onClick={() => setField('tags', form.tags?.filter((item) => item !== tag))}
              >
                {tag} ×
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Save trade'}
        </Button>
      </div>
    </form>
  );
};

export default JournalTradeForm;
