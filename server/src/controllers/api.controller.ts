import { Request, Response } from 'express';

export const getStocks = (_req: Request, res: Response) => {
  res.json({ data: [{ symbol: 'AAPL', name: 'Apple Inc.', price: 172.5 }] });
};

export const getDocuments = (_req: Request, res: Response) => {
  res.json({ data: [{ id: 'doc_1', title: 'Apple 2025 Annual Report' }] });
};

export const getChat = (_req: Request, res: Response) => {
  res.json({ data: [{ id: 'conv_1', lastMessage: 'Hello researcher' }] });
};

export const getWatchlist = (_req: Request, res: Response) => {
  res.json({ data: [{ symbol: 'AAPL' }, { symbol: 'MSFT' }] });
};
