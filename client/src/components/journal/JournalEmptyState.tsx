import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../ui/button';

const JournalEmptyState = ({
  title = "You haven't recorded any trades yet.",
  description = 'Add a trade you have already taken. MarketMind does not place orders.'
}: {
  title?: string;
  description?: string;
}) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-ink-900/50 px-6 py-12 text-center">
    <p className="text-base font-medium text-white">{title}</p>
    <p className="mt-2 text-sm text-slate-400">{description}</p>
    <Link to="/journal/trades/new" className="mt-5 inline-flex">
      <Button size="sm">
        <Plus className="h-4 w-4" />
        Add your first trade
      </Button>
    </Link>
  </div>
);

export default JournalEmptyState;
