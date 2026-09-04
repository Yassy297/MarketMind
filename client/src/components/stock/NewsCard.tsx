import React from 'react';
import { Newspaper } from 'lucide-react';

type NewsCardProps = {
  headline: string;
  summary: string;
  source: string;
  datetime: string;
  url: string;
  company?: string;
};

const NewsCard: React.FC<NewsCardProps> = ({
  headline,
  summary,
  source,
  datetime,
  url,
  company
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex gap-3 rounded-xl border border-line bg-surface-hover p-4 transition hover:border-brand/40 hover:bg-surface-hover"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
        <Newspaper className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-fg-muted">{source}</div>
        <div className="mt-1 font-medium text-fg group-hover:text-brand">{headline}</div>
        {summary ? <div className="mt-1.5 line-clamp-2 text-sm text-fg-secondary">{summary}</div> : null}
        <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-fg-muted">
          <span>{datetime}</span>
          {company ? <span>{company}</span> : null}
        </div>
      </div>
    </a>
  );
};

export default NewsCard;
