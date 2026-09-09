import Dialog from '../ui/Dialog';
import Button from '../ui/button';

type WatchlistDeleteDialogProps = {
  open: boolean;
  name: string;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

const WatchlistDeleteDialog = ({
  open,
  name,
  submitting = false,
  error,
  onClose,
  onConfirm
}: WatchlistDeleteDialogProps) => (
  <Dialog
    open={open}
    title={`Delete “${name}”?`}
    description="This will permanently remove the watchlist and its organization of tracked instruments. Your stocks will not be deleted."
    onClose={onClose}
    footer={
      <>
        <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="button" variant="danger" loading={submitting} onClick={onConfirm}>
          Delete watchlist
        </Button>
      </>
    }
  >
    {error ? (
      <p className="mm-alert-error" role="alert">
        {error}
      </p>
    ) : null}
  </Dialog>
);

export default WatchlistDeleteDialog;
