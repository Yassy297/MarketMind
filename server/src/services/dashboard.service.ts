import { Activity } from '../models/Activity';
import { Conversation } from '../models/Conversation';
import { Document } from '../models/Document';
import { RecentlyViewed } from '../models/RecentlyViewed';
import { Watchlist } from '../models/Watchlist';
import { Types } from 'mongoose';

export type DashboardSummary = {
  documentsCount: number;
  watchlistCount: number;
  conversationsCount: number;
  recentlyViewedCompanies: Array<{
    symbol: string;
    name: string;
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

    const [documentsCount, watchlistCount, conversationsCount, recentActivity, recentCompanies] = await Promise.all([
      Document.countDocuments({ userId: userObjectId }),
      Watchlist.countDocuments({ userId: userObjectId }),
      Conversation.countDocuments({ userId: userObjectId }),
      Activity.find({ userId: userObjectId }).sort({ createdAt: -1 }).limit(6).lean(),
      RecentlyViewed.find({ user: userObjectId }).sort({ viewedAt: -1 }).limit(5).lean()
    ]);

    const recentlyViewedCompanies = recentCompanies.map((item) => ({
      symbol: item.symbol,
      name: item.company,
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
