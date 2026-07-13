import React from 'react';

type NewsCardProps = {
  headline: string;
  summary: string;
  source: string;
  datetime: string;
  url: string;
};

const NewsCard: React.FC<NewsCardProps> = ({ headline, summary, source, datetime, url }) => {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block rounded-xl border border-gray-800 bg-gray-900/70 p-4 transition hover:border-indigo-500">
      <div className="text-xs uppercase tracking-[0.2em] text-gray-500">{source}</div>
      <div className="mt-2 font-semibold text-white">{headline}</div>
      <div className="mt-2 text-sm text-gray-400">{summary}</div>
      <div className="mt-3 text-xs text-gray-500">{datetime}</div>
    </a>
  );
};

export default NewsCard;
