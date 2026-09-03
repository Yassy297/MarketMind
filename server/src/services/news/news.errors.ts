export class NewsError extends Error {
  constructor(
    public readonly code: 'NEWS_PROVIDER_UNAVAILABLE' | 'NEWS_TEMPORARY_ERROR',
    message: string
  ) {
    super(message);
    this.name = 'NewsError';
  }
}
