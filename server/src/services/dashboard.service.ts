import { Activity } from '../models/Activity';
import { Conversation } from '../models/Conversation';
import { Document } from '../models/Document';
import { RecentlyViewed } from '../models/RecentlyViewed';
import { Watchlist } from '../models/Watchlist';
import { Types } from 'mongoose';
import type { CountryCode, CurrencyCode, MarketCode } from '../types/market';
import { buildInstrumentIdentityKey } from './watchlist.service';

export type DashboardSummary = {
  documentsCount: number;
  watchlistCount: number;
  conversationsCount: number;
  recentlyViewedCompanies: Array<{
    symbol: string;
    name: string;
    market?: MarketCode;
    exchange?: string;
    countryCode?: CountryCode;
    currency?: CurrencyCode;
    isin?: string;
    lastViewedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    createdAt: string;
  }>;
};

class DashboardService {
  async getSummaryForUser(userId: string): Promise<DashboardSummary> {
    const userObjectId = new Types.ObjectId(userId);

    const [documentsCount, watchlists, conversationsCount, recentActivity, recentCompanies] = await Promise.all([
      Document.countDocuments({ userId: userObjectId }),
      Watchlist.find({ userId: userObjectId }).select('items symbols').lean(),
      Conversation.countDocuments({ userId: userObjectId }),
      Activity.find({ userId: userObjectId }).sort({ createdAt: -1 }).limit(6).lean(),
      RecentlyViewed.find({ user: userObjectId }).sort({ viewedAt: -1 }).limit(5).lean()
    ]);
    const trackedInstrumentKeys = new Set<string>();
    for (const watchlist of watchlists) {
      for (const item of watchlist.items ?? []) {
        trackedInstrumentKeys.add(item.identityKey);
      }
      for (const symbol of watchlist.symbols ?? []) {
        trackedInstrumentKeys.add(buildInstrumentIdentityKey({ symbol }));
      }
    }
    const watchlistCount = trackedInstrumentKeys.size;

    const recentlyViewedCompanies = recentCompanies.map((item) => ({
      symbol: item.symbol,
      name: item.company,
      market: item.market,
      exchange: item.exchange,
      countryCode: item.countryCode,
      currency: item.currency,
      isin: item.isin,
      lastViewedAt: item.viewedAt.toString()
    }));

    return {
      documentsCount,
      watchlistCount,
      conversationsCount,
      recentlyViewedCompanies,
      recentActivity: recentActivity.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        description: item.description ?? '',
        type: item.type,
        createdAt: item.createdAt.toString()
      }))
    };
  }
}

export const dashboardService = new DashboardService();
