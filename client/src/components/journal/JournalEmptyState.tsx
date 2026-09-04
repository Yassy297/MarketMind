import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import Button from '../ui/button';
import EmptyState from '../ui/EmptyState';

const JournalEmptyState = ({
  title = "You haven't recorded any trades yet.",
  description = 'Add a trade you have already taken. MarketMind does not place orders.'
}: {
  title?: string;
  description?: string;
}) => (
  <div className="rounded-xl border border-dashed border-line bg-background-secondary">
    <EmptyState
      icon={BookOpen}
      title={title}
      description={description}
      action={
        <Link to="/journal/trades/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add your first trade
          </Button>
        </Link>
      }
    />
  </div>
);

export default JournalEmptyState;
