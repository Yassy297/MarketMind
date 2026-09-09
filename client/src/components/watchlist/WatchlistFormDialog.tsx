import { useEffect, useId, useState, type FormEvent } from 'react';
import Dialog from '../ui/Dialog';
import Button from '../ui/button';
import Input from '../ui/input';
import Textarea from '../ui/textarea';

type WatchlistFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialName?: string;
  initialDescription?: string;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: { name: string; description: string }) => void;
};

const WatchlistFormDialog = ({
  open,
  mode,
  initialName = '',
  initialDescription = '',
  submitting = false,
  error,
  onClose,
  onSubmit
}: WatchlistFormDialogProps) => {
  const nameId = useId();
  const descriptionId = useId();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDescription(initialDescription);
  }, [initialDescription, initialName, open]);

  const trimmedName = name.trim();
  const invalid = trimmedName.length === 0 || trimmedName.length > 80;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (invalid || submitting) return;
    onSubmit({ name: trimmedName, description: description.trim() });
  };

  return (
    <Dialog
      open={open}
      title={mode === 'create' ? 'New watchlist' : 'Edit watchlist'}
      description={
        mode === 'create'
          ? 'Create a list for the companies and instruments you are researching.'
          : 'Rename this list or update its description. Instruments stay unchanged.'
      }
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={`${nameId}-form`} loading={submitting} disabled={invalid}>
            {mode === 'create' ? 'Create watchlist' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form id={`${nameId}-form`} className="space-y-3" onSubmit={submit}>
        <label className="block text-sm text-fg-secondary" htmlFor={nameId}>
          Name
          <Input
            id={nameId}
            className="mt-1"
            value={name}
            maxLength={80}
            required
            invalid={open && name.trim().length === 0}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="block text-sm text-fg-secondary" htmlFor={descriptionId}>
          Description <span className="text-fg-muted">(optional)</span>
          <Textarea
            id={descriptionId}
            className="mt-1"
            value={description}
            maxLength={500}
            rows={3}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        {error ? (
          <p className="mm-alert-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
};

export default WatchlistFormDialog;
