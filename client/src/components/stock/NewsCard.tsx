import React from 'react';
import { Newspaper } from 'lucide-react';

type NewsCardProps = {
  headline: string;
  summary: string;
  source: string;
  datetime: string;
  url: string;
};

const NewsCard: React.FC<NewsCardProps> = ({ headline, summary, source, datetime, url }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex gap-3 rounded-xl border border-white/6 bg-white/[0.02] p-4 transition hover:border-violet-500/40 hover:bg-white/[0.04]"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
        <Newspaper className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{source}</div>
        <div className="mt-1 font-medium text-white group-hover:text-violet-200">{headline}</div>
        <div className="mt-1.5 line-clamp-2 text-sm text-slate-400">{summary}</div>
        <div className="mt-2 text-xs text-slate-600">{datetime}</div>
      </div>
    </a>
  );
};

export default NewsCard;
