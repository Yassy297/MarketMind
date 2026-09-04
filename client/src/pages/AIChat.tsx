import React from 'react';
import { MessageSquare, Plus, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/button';

const AIChat: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader
        title="AI Chat"
        subtitle="Chat with your documents and market data."
        action={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card lg:flex lg:flex-col">
          <div className="border-b border-line px-4 py-3 text-sm font-medium text-fg-secondary">Conversations</div>
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <MessageSquare className="h-6 w-6 text-fg-muted" />
            <p className="text-sm text-fg-muted">No conversations yet. Start a new chat to begin.</p>
          </div>
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand ring-1 ring-inset ring-brand/30">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="text-base font-medium text-fg">The chat interface is coming soon</div>
            <p className="max-w-sm text-sm text-fg-muted">
              Once connected, you'll be able to ask questions about your uploaded documents and market data here.
            </p>
          </div>
          <div className="border-t border-line p-4">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-background/80 px-3 py-2.5">
              <input
                disabled
                placeholder="Ask anything about your documents..."
                className="flex-1 bg-transparent text-sm text-fg-secondary outline-none placeholder:text-fg-muted"
              />
              <button disabled className="rounded-lg p-1.5 text-fg-muted">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
