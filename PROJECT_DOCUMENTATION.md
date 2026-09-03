# MarketMind Project Documentation

## Overview

MarketMind is a full-stack SaaS-style financial research platform with a React + Vite + TypeScript frontend, Express + TypeScript backend, and MongoDB data layer. The application provides stock intelligence through a multi-market, multi-provider abstraction layer supporting 22 geographic markets with provider-specific implementations, capability-aware fallback logic, and centralized display-currency conversion.

### Core Features

- **Stock Research**: Live stock search, profiles, pricing, news, analyst recommendations, and progressive Indian company fundamentals
- **Multi-Market Support**: 22 configured markets (IN, US, GB, CA, AU, JP, CN, HK, SG, CH, KR, BR, MX, ZA, AE, SA, NZ, DE, FR, NL, ES, IT) with country-specific preferences and capability-aware provider selection
- **Market Context**: User market/country/currency preferences persisted to database; automatic market resolution by country
- **Provider Abstraction**: Normalized API contracts that isolate frontend components from provider-specific implementations
- **Multi-Provider Support**: Finnhub (✅ operational), Upstox (✅ Indian research data with provider limitations), Twelve Data (🔶 scaffolded)
- **Real Exchange-Rate Conversion**: Live currency conversion via Frankfurter API with intelligent caching and deduplication
- **Instrument Resolution**: Symbol-to-ISIN mapping for India; provider-aware instrument identification across markets
- **Recently Viewed History**: Per-user tracking of symbol, company, exchange, market, country, currency, and ISIN where available
- **Browser Branding**: SVG favicon derived from the existing in-app MarketMind trend logo
- **Cookie-Based Authentication**: httpOnly cookies, refresh token rotation, session restoration
- **Protected Routes**: Authentication guard on all research features
- **Trade Journal**: Record, review, and analyze trades already taken (MarketMind does not place or execute orders)

## High-Level Architecture

```
┌─────────────────────────┐
│   MarketMind Frontend   │
│   (React + Tailwind)    │
└────────────┬────────────┘
             │
      ┌──────▼──────┐
      │   Axios     │
      │   (w/ auth  │
      │  cookies)   │
      └──────┬──────┘
             │
┌────────────▼──────────────────────────┐
│     MarketMind Backend API             │
│  (Express + TypeScript)                │
├────────────────────────────────────────┤
│  Routes:                               │
│  - /auth/* (login, register, refresh)  │
│  - /api/stocks/* (search, data)        │
│  - /api/market/context (preferences)   │
│  - /api/journal/* (trade journal)      │
└────────────┬──────────────────────────┘
             │
   ┌─────────▼──────────┐
   │  Market Data       │
   │  Service Layer     │
   │  - Provider        │
   │    Resolver        │
   │  - Normalizer      │
   │  - Currency        │
   │    Conversion      │
   └─────────┬──────────┘
             │
┌────────────▼────────────────────────────────────┐
│    Provider Implementations                    │
├────────────────────────────────────────────────┤
│  ✅ Finnhub      - IMPLEMENTED                  │
│  ✅ Upstox       - INDIAN RESEARCH IMPLEMENTED │
│  ✅ Marketaux    - NEWS IMPLEMENTED            │
│  🔶 Twelve Data  - SCAFFOLDED (not enabled)    │
│  ✅ Frankfurter  - EXCHANGE RATE PROVIDER      │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────┐
│  External APIs / Data Providers            │
│  (Finnhub, Upstox, Marketaux, Twelve Data) │
└───────────────────────────────────────────┘

        ▼
┌──────────────────────┐
│    MongoDB          │
│  - User prefs       │
│  - Recently viewed  │
│  - JournalTrade     │
│  - Watchlist (model only) │
└──────────────────────┘
```

### Why Provider Abstraction?

1. **Market Complexity**: Different countries require different data providers (India → Upstox; Global → Finnhub/Twelve Data)
2. **API Heterogeneity**: Providers expose different fields; normalization creates a consistent schema
3. **Flexibility**: Replace or add providers without rewriting frontend components
4. **Data Isolation**: Frontend never sees raw provider responses; only normalized MarketMind contracts
5. **Currency Handling**: Centralized conversion logic prevents display currency leakage into calculations

## Market Data Provider Architecture

### Provider Abstraction (`server/src/services/market-data/`)

**Files:**

- `marketData.service.ts` - high-level market data API that delegates to resolved providers
- `marketData.providerResolver.ts` - selects the best provider for a market and capability
- `marketData.types.ts` - normalized TypeScript types (all data responses must conform)
- `marketData.normalizer.ts` - normalization functions (currently Finnhub only)
- `providers/` - provider implementations

### Normalized Types

All providers return data matching these normalized TypeScript types (defined in `marketData.types.ts`):

**Stock Identity:**
- `symbol`: stock symbol (uppercase)
- `displaySymbol`: display symbol for UI
- `name`: company name
- `market`: market code (IN, US)
- `exchange`: exchange name
- `instrumentType`: optional (stock, ETF, etc.)
- `isin`: optional ISIN for fundamentals queries

**Stock Search Results:**
- `symbol`, `displaySymbol`, `companyName`, `description`, `exchange`, `exchangeCode`
- `market`, `countryCode`, `countryName`, `currency`, `isin`, `instrumentType`, `provider`
- Fields that a provider does not supply remain `null`; they are never fabricated

**Company Profile:**
- `name`, `ticker`, `exchange`, `industry`, `marketCapitalization`, `currency`, `country`, `ipo`, `logo`, `weburl`
- `marketCapitalizationMoney`: optional converted company market cap
- `sector`, `isin`, `instrumentKey`, `description`, and `sectorMarketCapitalization` when the provider supplies them
- Missing company market capitalization is represented as `null`, never zero, and never replaced by sector market cap

**Price Data:**
- `currentPrice`, `change`, `percentChange`, `high`, `low`, `open`, `previousClose`, `timestamp`
- `monetary`: optional field containing converted monetary values

**News Item:**
- Canonical type is `NewsItem` in `server/src/services/news/news.types.ts`
- `id`, `headline`, `summary`, `url`, `datetime`, `source`
- Optional: `imageUrl`, `symbols`, `companyName`, `exchange`, `country`, `sentiment`, `publishedAt`, `sourceProvider`

**Analyst Recommendation:**
- `symbol`, `buy`, `hold`, `sell`, `period`

**Normalized Stock Data (composite):**
- `identity`: StockIdentity
- `profile`: CompanyProfile
- `price`: PriceData
- `news`: NewsItem[]
- `recommendation`: AnalystRecommendation

**Indian Research Contracts:**
- `FundamentalsOverview`: `CompanyFundamentals`, `ValuationMetrics`, `ProfitabilityMetrics`, `PerShareMetrics`, and section availability
- `PerShareMetrics`: `eps`, `bookValuePerShare`, `dividendPerShare`, `faceValue` as `AnnotatedMonetaryValue`; `dividendYield` as `AnnotatedPercentage`
- `AnnotatedMonetaryValue` / `AnnotatedPercentage`: preserve `source: 'provider' | 'derived'` and optional `derivation`
- `BenchmarkMetric`: preserves both `value` and `sectorBenchmark` for P/E, P/B, ROA, ROE, ROCE, and EV/EBITDA
- `FinancialStatementsResearch`: normalized income statement, balance sheet, and cash flow sections
- `FinancialStatementData`, `StatementSeries`, and `StatementHistoryPoint`: summary and detailed line items with source/display currency metadata
- `ShareholdingResearch` and `ShareholdingCategory`: complete quarterly promoter, FII, other DII, mutual-fund, and retail/other history
- `CorporateActionsResearch` and `CorporateAction`: amount, ratio, effective/ex date, announcement date, record date, and provider details
- `CompetitorsResearch` and `PeerData`: trusted instrument identity, description, sector, and sector market capitalization
- `SectionAvailability`: `available`, `unavailable`, or `not-supported`; one failed section does not invalidate another

### Provider Interface

All providers implement `MarketDataProvider`:

```typescript
interface MarketDataProvider {
  readonly name: string;
  isConfigured(): boolean;
  supports(capability: MarketDataCapability): boolean;
  search(query: string, context: MarketRequestContext): Promise<SearchResult[]>;
  getProfile(symbol: string, context: MarketRequestContext): Promise<CompanyProfile>;
  getQuote(symbol: string, context: MarketRequestContext): Promise<PriceData>;
  getNews(symbol: string, context: MarketRequestContext): Promise<NewsItem[]>;
  getRecommendation(symbol: string, context: MarketRequestContext): Promise<AnalystRecommendation>;
  getFundamentals?(symbol: string, context: MarketRequestContext): Promise<FundamentalsOverview>;
  getFinancialStatements?(symbol: string, context: MarketRequestContext, options: FinancialStatementOptions): Promise<FinancialStatementsResearch>;
  getShareholding?(symbol: string, context: MarketRequestContext): Promise<ShareholdingResearch>;
  getCorporateActions?(symbol: string, context: MarketRequestContext): Promise<CorporateActionsResearch>;
  getCompetitors?(symbol: string, context: MarketRequestContext): Promise<CompetitorsResearch>;
}
```

### Provider Resolver

The resolver (`marketData.providerResolver.ts`) follows this logic:

1. Check environment config for market-specific provider (`MARKET_PROVIDER_IN`, `MARKET_PROVIDER_US`)
2. Check market's preferred providers list (from `config/markets.ts`)
3. Fall back to default provider (`MARKET_PROVIDER_DEFAULT`)
4. Always include `finnhub` as the final fallback
5. Return the first `isConfigured()` and `supports(capability)` provider; else Finnhub
6. Upstox is only a candidate for the India market (`IN`); it is not a global fundamentals fallback

If no configured provider supports the requested capability, the resolver returns a controlled `MARKET_PROVIDER_UNAVAILABLE` error. Credentials remain optional at application startup.

## Providers

### Finnhub

**Status: Implemented; live-verified for AAPL, TSLA, NVDA, and MSFT**

Provides live stock search, profile, quote, and analyst recommendation data for global markets. Company news is now served by the dedicated News Service; Finnhub remains a news fallback provider.

**Environment Variables:**
- `FINNHUB_API_KEY` - API key (required)

**Capabilities:**
- Search: ✅
- Profile: ✅
- Quote: ✅
- News: 🔶 fallback only, through the News Service
- Recommendation: ✅
- Fundamentals / ratios / statements / shareholding / corporate actions / competitors: ❌ (`supports()` is false; global stocks receive `not-supported` rather than fake zeros)

**Data Flow:**
1. Frontend requests via `GET /api/stocks/search?q=TSLA&market=US&currency=USD`
2. Backend calls `marketDataService.search()` with MarketRequestContext
3. Provider resolver selects Finnhub
4. Finnhub API called with query and symbol
5. Response normalized via `normalizeFinnhubSearchResults()` etc.
6. Currency conversion applied if needed (market cap, etc.)
7. Normalized response returned to frontend

### Upstox

**Status: ✅ INDIAN RESEARCH IMPLEMENTED WITH PROVIDER LIMITATIONS**

Upstox supplies Indian equity search, quote, profile, ratios, statements, shareholding, corporate actions, and competitors through the provider abstraction. React never calls Upstox directly.

**File:** `server/src/services/market-data/providers/upstox/upstox.provider.ts`

**Current Implementation:**
- ✅ `isConfigured()` checks for `UPSTOX_ACCESS_TOKEN` environment variable
- ✅ `supports()` advertises search, profile, quote, fundamentals, ratios, financial statements, shareholding, corporate actions, and competitors
- ✅ `search()` implemented via `upstoxInstrumentService` with NSE/BSE prioritization
- ✅ `getProfile()` implemented with ISIN-based fundamental data retrieval
- ✅ `getQuote()` implemented with live NSE/BSE market data
- ❌ `getNews()` not implemented (throws MARKET_PROVIDER_UNAVAILABLE)
- ❌ `getRecommendation()` not implemented (throws MARKET_PROVIDER_UNAVAILABLE)
- ✅ `getFundamentals()` preserves company and sector benchmarks for six key ratios and exposes provider EPS plus labeled derived book value, dividend yield, and face value when the inputs exist
- ✅ `getFinancialStatements()` supports yearly/quarterly income and consolidated/standalone scope; balance sheet and cash flow remain annual per Upstox; equity capital and year-end cash are added to the summary when present
- ✅ `getShareholding()` preserves all available quarterly history
- ✅ `getCorporateActions()` supports dividend, bonus, split, and rights payloads without fabricating unavailable event fields
- ✅ `getCompetitors()` uses the trusted resolver instrument key because the live ISIN competitors path returns HTTP 400; peer names/symbols are enriched through trusted instrument search when an ISIN is present in the peer key

**Instrument Resolution:**
- Dedicated `upstoxInstrumentService` in `server/src/services/market-data/providers/upstox/upstox.instrument.service.ts`
- Symbol parsing with `.NS` (NSE) and `.BO` (BSE) suffixes
- Search caching: 5-minute TTL
- Resolution caching: 12-hour TTL
- Fundamentals caching: 4-hour in-memory TTL with in-flight request deduplication
- Profile, ratios, statements, shareholding, and corporate actions use the resolved ISIN
- The live Upstox competitors route currently requires the resolved Upstox instrument key even though its documentation describes an ISIN path; MarketMind uses the trusted resolver result and does not construct or guess the key

**Environment configuration:**
- `UPSTOX_ACCESS_TOKEN` - required at runtime for the implemented Indian data calls
- `UPSTOX_API_KEY` and `UPSTOX_API_SECRET` - accepted by server configuration for future token lifecycle work; not sent to the browser and not used by current read-only request methods

**Supported Indian Markets:**
- NSE (National Stock Exchange) - suffix `.NS`
- BSE (Bombay Stock Exchange) - suffix `.BO`
- Currency: INR

**Limitations:**
- News and analyst recommendations are not provided by the Upstox provider
- Fundamentals require a resolvable ISIN; competitors additionally require the trusted provider instrument key
- The company-profile endpoint reports sector market capitalization, not company market capitalization
- Company market capitalization is not supplied by Upstox company profile; MarketMind does not substitute sector market cap or invent a market-cap from PAT/EPS
- Book value per share, dividend yield, and face value are shown only when they can be derived from provider inputs and are labeled `derived`
- Shares outstanding and company-level debt are not displayed because they are not reliably available
- Historical market-price series are not implemented

### Twelve Data

**Status: 🔶 SCAFFOLDED (NOT CONFIGURED)**

Provider skeleton for potential global market data as an alternative to Finnhub.

**File:** `server/src/services/market-data/providers/twelveData/twelveData.provider.ts`

**Current State:**
- Class defined and registered in provider resolver
- `isConfigured()` always returns `false` (not configured)
- `supports()` always returns `false` (not enabled)
- All methods throw "not configured" error

**Environment Variables:**
- `TWELVE_DATA_API_KEY` - Would be required if implemented (not currently used)

**When Ready for Implementation:**
1. Obtain Twelve Data API credentials
2. Implement provider configuration check in env.ts
3. Implement API call logic for search, profile, quote, news, recommendation
4. Create normalizer functions for Twelve Data payloads
5. Set `MARKET_PROVIDER_US=twelveData` or `MARKET_PROVIDER_DEFAULT=twelveData` in environment
6. Test with real data from configured markets

## News Architecture

News is independent of the market-data provider layer. The frontend never calls a news vendor and does not choose Marketaux or Finnhub.

```
Frontend
    ↓
GET /api/stocks/:symbol/news
    ↓
News Service
    ↓
News Provider Resolver
    ↓
Marketaux (primary) → Finnhub (fallback)
    ↓
News Normalizer
    ↓
Normalized NewsItem[]
    ↓
Frontend
```

**Files:** `server/src/services/news/news.service.ts`, `news.providerResolver.ts`, `news.types.ts`, `providers/marketaux/`, `providers/finnhub/finnhubNews.provider.ts`

### Provider Status

**Marketaux: IMPLEMENTED**

- Environment variable: `MARKETAUX_API_KEY`
- Endpoints used: `GET /v1/entity/search`, `GET /v1/news/all`
- Resolves company identity (symbol, company name, exchange, country, ISIN) before requesting news
- Fallback order: entity/symbol news, then company-name search, then company+country search
- Unrelated generic country news is not returned
- Requests `limit=3` to stay within the Marketaux free-plan page size
- 15-minute in-memory cache; quotes are not cached with this policy
- News is never currency-converted

**Finnhub news: FALLBACK**

- Finnhub remains the global market-data provider for search, profile, quote, and recommendations
- `FinnhubNewsProvider` is used only when Marketaux is unconfigured or a Marketaux request fails
- Finnhub is not treated as reliable Indian-market news coverage

### News API

`GET /api/stocks/:symbol/news` returns a MarketMind `NewsItem[]`. An empty list means no relevant articles. Provider failure returns `News temporarily unavailable.` without vendor errors or tokens.

### Indian and global news

Indian equities such as HDFCBANK.NS use the same News Service as AAPL, TSLA, and NVDA. Country/market context is used to resolve the company and filter relevance. The Stocks page shows Latest news with loading independent of quotes and fundamentals.

## Markets & Regional Support

### Configured Markets

Defined in `server/src/config/markets.ts`. MarketMind configures 22 country/market entries across 6 continents:

| Code | Country | Currency | Exchanges | Preferred Providers |
|------|---------|----------|-----------|---------------------|
| IN | India | INR | NSE, BSE | upstox, finnhub |
| US | United States | USD | NASDAQ, NYSE, AMEX | finnhub, twelveData |
| GB | United Kingdom | GBP | LSE | finnhub, twelveData |
| CA | Canada | CAD | TSX, TSXV | finnhub, twelveData |
| AU | Australia | AUD | ASX | finnhub, twelveData |
| JP | Japan | JPY | TSE | finnhub, twelveData |
| CN | China | CNY | SSE, SZSE | finnhub, twelveData |
| HK | Hong Kong | HKD | HKEX | finnhub, twelveData |
| SG | Singapore | SGD | SGX | finnhub, twelveData |
| CH | Switzerland | CHF | SIX | finnhub, twelveData |
| KR | South Korea | KRW | KRX, KOSDAQ | finnhub, twelveData |
| BR | Brazil | BRL | B3 | finnhub, twelveData |
| MX | Mexico | MXN | BMV | finnhub, twelveData |
| ZA | South Africa | ZAR | JSE | finnhub, twelveData |
| AE | UAE | AED | ADX, DFM | finnhub, twelveData |
| SA | Saudi Arabia | SAR | TADAWUL | finnhub, twelveData |
| NZ | New Zealand | NZD | NZX | finnhub, twelveData |
| DE | Germany | EUR | XETRA, FWB | finnhub, twelveData |
| FR | France | EUR | EURONEXT PARIS | finnhub, twelveData |
| NL | Netherlands | EUR | EURONEXT AMSTERDAM | finnhub, twelveData |
| ES | Spain | EUR | BME | finnhub, twelveData |
| IT | Italy | EUR | BORSA ITALIANA | finnhub, twelveData |

### Market Resolution

When a frontend request arrives:
1. If market parameter provided in request, use that
2. Else if user's saved preference exists (`user.preferences.market`), use that
3. Else if `MARKET_PROVIDER_DEFAULT` env var set, use configured market
4. Else fallback to provider's global defaults

**Provider Selection Logic:**
1. Check market-specific environment variable (`MARKET_PROVIDER_IN`, `MARKET_PROVIDER_US`, etc.)
2. Check market's `preferredProviders` list
3. Filter to `isConfigured()` && `supports(capability)` providers
4. Fall back to Finnhub (always available as final fallback)

## User Market Preferences

### Database Model

`server/src/models/User.ts`:

```typescript
preferences?: {
  country: CountryCode;  // 'IN' | 'US' | 'GB' | 'CA' | 'AU' | 'JP' | 'CN' | 'HK' | 'SG' | 'CH' | 'KR' | 'BR' | 'MX' | 'ZA' | 'AE' | 'SA' | 'NZ' | 'DE' | 'FR' | 'NL' | 'ES' | 'IT'
  market: MarketCode;    // independently stored market selection
  currency: CurrencyCode; // 'INR' | 'USD' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'HKD' | 'SGD' | 'CHF' | 'KRW' | 'BRL' | 'MXN' | 'ZAR' | 'AED' | 'SAR' | 'NZD' | 'EUR'
}
```

Defaults to `null` for each field (no preference set initially).

### API Endpoints

**Get User Preferences:**
```
GET /api/market/context
Authorization: Bearer <token>
```

Response includes user's current preferences and all supported markets/currencies:
```json
{
  "preferences": {
    "country": "IN",
    "market": "IN",
    "currency": "INR"
  },
  "supportedMarkets": [
    {
      "countryCode": "IN",
      "countryName": "India",
      "market": "IN",
      "defaultCurrency": "INR",
      "flag": "🇮🇳",
      "exchanges": ["NSE", "BSE"]
    },
    { ... 21 more markets ... }
  ],
  "supportedCurrencies": ["INR", "USD", "GBP", "CAD", "AUD", "JPY", "CNY", "HKD", "SGD", "CHF", "KRW", "BRL", "MXN", "ZAR", "AED", "SAR", "NZD", "EUR"]
}
```

**Update Preferences:**
```
PATCH /api/market/context
Authorization: Bearer <token>
Content-Type: application/json

{
  "country": "US",
  "currency": "USD"
}
```

**Logic:**
- If `country` changes, `market` is set from that country's configured default market
- Country, market, and exchange remain separate fields even though the current registry exposes one primary market per country
- A default currency is applied only while `currencyCustomized` is false; explicit display-currency choices are preserved
- All fields are validated against `config/markets.ts` and `config/currencies.ts`
- Preference update triggers frontend query invalidation (see Market Context Frontend section)

**Provider-neutral stock research endpoints:**
```
GET /api/stocks/:symbol/fundamentals
GET /api/stocks/:symbol/statements?type=consolidated&period=yearly
GET /api/stocks/:symbol/shareholding
GET /api/stocks/:symbol/corporate-actions
GET /api/stocks/:symbol/competitors
```

- `type`: `consolidated` or `standalone`
- `period`: `yearly` or `quarterly`; this changes the income statement, while Upstox balance sheet and cash flow data remain annual
- Every endpoint accepts the existing `market` and `currency` query parameters
- Responses contain only MarketMind normalized contracts; raw Upstox response objects are not returned
- Unsupported global capabilities return `not-supported` availability instead of misleading zero values

### Frontend State Management

**Context:** `client/src/context/MarketContext.tsx`

Provides:
- `country`: user's selected country code
- `market`: derived market code
- `currency`: display currency
- `loading`: preference update in progress
- `setCountry(country)`: async update; triggers market refetch and query invalidation
- `setCurrency(currency)`: async update; triggers query refetch

**Query Invalidation:**
When market or currency changes:
1. Cancel active queries for market-aware endpoints
2. Persist preference update to backend
3. Refetch all relevant basic and research queries, including fundamentals, statements, shareholding, corporate actions, and competitors
4. Show `MarketTransitionLoader` overlay while loading

### Frontend UI

**Navbar Selectors** (`client/src/components/Navbar.tsx`):
- Country dropdown: shows all supported countries with flags
- Currency dropdown: shows all supported currencies
- Both disabled while `loading` is true
- On change, call `setCountry()` or `setCurrency()`

**Initial State:**
- On app load, no country/currency is pre-selected
- User can select any; preference is saved to database
- On page reload, preference is fetched and applied

## Stock Search & Navigation

### Search Architecture

The search flow resolves instruments across multiple providers and markets:

1. **User Query**: Symbol or company name (e.g., "TSLA", "Tesla", "hdfc")
2. **Query normalization**: `normalizeInstrumentSearchQuery` trims, collapses whitespace, and case-folds (`hdfc` / `HDFC` / `Hdfc` all become `HDFC`) before any provider is called. The UI does not rewrite the typed value.
3. **Instrument Search Service**: Calls all configured providers supporting 'search' capability with the normalized query
4. **Provider Search Results**: Each provider returns normalized `SearchResult[]`
5. **Deduplication**: Results deduplicated by `symbol::exchangeCode` (first occurrence wins)
6. **Market Prioritization**: Results sorted by context market priority
7. **Result Limit**: Maximum 20 results returned to frontend
8. **Provider Keys Removed**: `providerInstrumentKey` stripped from public API response (only used internally for fundamentals)

### Search Endpoint

```
GET /api/stocks/search?q=<query>&market=<market>&currency=<currency>
Authorization: Bearer <token>
```

Query parameters:
- `q` (required): Search query (symbol or company name)
- `market` (optional): Market code to prioritize (e.g., 'IN', 'US'); overrides user preference
- `currency` (optional): Display currency (overrides user preference)

Response: `SearchResult[]` (up to 20 items)

```json
[
  {
    "symbol": "<provider symbol>",
    "displaySymbol": "<display symbol>",
    "description": "<provider company name>",
    "type": "Common Stock",
    "companyName": "<provider company name>",
    "exchange": null,
    "exchangeCode": null,
    "market": null,
    "countryCode": null,
    "countryName": null,
    "currency": null,
    "isin": null,
    "instrumentType": "Common Stock",
    "provider": "finnhub"
  }
]
```

Finnhub search does not supply exchange, country, currency, or ISIN for every result, so those fields remain `null`. Upstox Indian equity results include trusted NSE/BSE, INR, instrument key, and ISIN metadata from the instrument search API.

### Search Result Details

Each result includes:
- **Unique Identification**: `symbol`, `displaySymbol`, `isin`
- **Market Context**: `market`, `countryCode`, `countryName`, `exchange`, `exchangeCode`
- **Financial Context**: `currency`, `instrumentType`
- **Provider**: Which provider sourced this result

For Indian stocks with NSE/BSE suffixes:
```json
{
  "symbol": "HDFCLIFE.NS",
  "displaySymbol": "HDFCLIFE",
  "exchange": "NSE",
  "market": "IN",
  "currency": "INR",
  "isin": "INE795G01014"
}
```

### Frontend Search Flow

1. User types in search box (`StockSearch.tsx`)
2. Query debounced 300ms
3. `searchStocks()` called with current market + currency context
4. Results display in dropdown with company name, symbol, exchange
5. User clicks result → `onSelect()` callback
6. App navigates to `/stocks?symbol=TSLA&market=US`
7. Stocks page loads profile and quote first, then news, recommendation, and Indian research sections independently

### Stock Detail

The Stocks page keeps the existing MarketMind layout. Indian instruments load research sections progressively; global instruments hide those sections unless the selected market/symbol is Indian.

1. Stock header: name, symbol, exchange, sector, ISIN, country, currency
2. Quote cards: price, day change, company market cap (or `Not available`), sector market cap when provided, display currency
3. Key metrics: price, sector market cap, P/E, P/B, ROE, ROCE, ROA, EV/EBITDA, book value, EPS, dividend, dividend yield, face value — only fields with actual data
4. Valuation: P/E, P/B, EV/EBITDA with sector benchmark and an objective Above/Below/In line indicator
5. Profitability: ROE, ROCE, ROA with sector benchmark
6. Company overview: description, ISIN, exchange, sector market cap
7. Financial performance: income statement table with Annual/Quarterly and Consolidated/Standalone controls
8. Balance sheet: assets, liabilities, and Equity Capital when present
9. Cash flow: operating, investing, financing, and year-end cash when present
10. Shareholding: current/previous quarter cards plus full quarterly history
11. Corporate actions: newest first; empty state remains visible
12. Competitors: provider peers only
13. News and analyst recommendation continue to use the existing cards

One failed research endpoint leaves the rest of the page intact.

### URL Query Parameters

**Stocks Page** (`client/src/pages/Stocks.tsx`):

- `symbol`: stock symbol (required); defaults to `TSLA` if not provided
- `market`: override market context; used for cross-market searches (e.g., `/stocks?symbol=HDFCLIFE&market=IN`)

### Deduplication Rules

Results deduplicated by composite key: `symbol::exchangeCode`

Example:
- If both Finnhub and Upstox return results for "INFY" on NSE, first result is kept
- Exact duplicate `symbol + exchangeCode` records are merged
- Genuine NSE and BSE listings remain separate because their symbols/exchange codes differ

## Recently Viewed History

### Database Model

`server/src/models/RecentlyViewed.ts`:

```typescript
{
  user: ObjectId;           // reference to User
  symbol: string;           // stock symbol (uppercase with exchange suffix if applicable)
  company: string;          // company name
  market?: MarketCode;      // market code ('IN' | 'US' | 'GB' | 'CA' | ... | 'IT')
  exchange?: string;
  countryCode?: CountryCode;
  currency?: CurrencyCode;
  isin?: string;
  viewedAt: Date;           // timestamp of most recent view
  createdAt, updatedAt: Date;
}
```

Indexes:
- `{ user, viewedAt }` - fetch history sorted by recency
- `{ user, symbol }` - unique constraint; upsert on every view

### Recording Views

When a user loads a stock profile (`GET /api/stocks/:symbol/profile` or `/api/stocks/:symbol`):

1. Backend controller calls `stockService.recordRecentlyViewed(userId, symbol, normalizedProfile, marketContext)`
2. Service checks for existing `{ user, symbol }` record
3. If exists: update `viewedAt` and available normalized identity metadata
4. If not: create new record

**No frontend-side tracking:** the backend is the source of truth.

### Fetching History

```
GET /api/stocks/recently-viewed
Authorization: Bearer <token>
```

Returns up to 5 most recent records (limit hardcoded in controller), sorted by `viewedAt` descending:

```json
[
  {
    "symbol": "TSLA",
    "company": "Tesla Inc",
    "market": "US",
    "viewedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Frontend Display

`client/src/pages/Stocks.tsx` uses React Query to fetch and display recently viewed history as clickable cards. Clicking a card updates the search box and navigates.

## Currency Conversion

### Architecture

Currency conversion is implemented using current reference rates from the Frankfurter API.

**Service:** `server/src/services/currency/currency.service.ts`

**Exchange Rate Provider:** `server/src/services/currency/frankfurter.provider.ts`

**Types:** `server/src/services/currency/currency.types.ts` defines `ExchangeRateProvider` interface

### Frankfurter Exchange Rate Provider

**Status: Implemented and live-verified**

Provides current reference exchange rates via the public Frankfurter API.

**Features:**
- **API**: https://api.frankfurter.dev/v2
- **Caching**: 6-hour TTL per currency pair
- **Request Deduplication**: Concurrent requests for same pair consolidated into single API call
- **Fallback**: Returns `null` if rate unavailable (triggers "unavailable" status in UI)
- **Timeout**: 8-second timeout per request

**How It Works:**

1. Frontend requests USD stock data with INR display currency
2. Backend checks if source currency === display currency
   - If yes → no conversion needed (`status: 'not-required'`)
   - If no → fetch rate from Frankfurter
3. Cache check: If rate cached and not expired, use cached rate
4. Deduplication: If concurrent request for same pair, wait for first request
5. API call: `GET /v2/rate/USD/INR`
6. Response cached with 6-hour expiry
7. Value converted: `sourceValue * rate`

### Monetary Value Structure

All monetary values returned from the API include full conversion context:

```typescript
{
  value: number;              // original amount
  sourceCurrency: CurrencyCode; // original currency (e.g., USD)
  displayCurrency: CurrencyCode; // target currency (e.g., INR)
  convertedValue: number | null;  // result of conversion (null if unavailable)
  conversionStatus: 'not-required' | 'converted' | 'unavailable';
}
```

### Conversion Examples

**Same Currency (No Conversion):**

User in India viewing USD stock with INR display:
```json
{
  "currentPrice": 250,
  "sourceCurrency": "USD",
  "displayCurrency": "INR",
  "convertedValue": 20750,
  "conversionStatus": "converted"
}
```

**Rate Unavailable:**

If Frankfurter API is unreachable or rate not available:
```json
{
  "currentPrice": 250,
  "sourceCurrency": "USD",
  "displayCurrency": "INR",
  "convertedValue": null,
  "conversionStatus": "unavailable"
}
```

Frontend shows an explicit `Conversion unavailable` state when a requested conversion cannot be performed.

### What Gets Converted

**Converted (Monetary Values):**
- Stock price, change, high, low, open, previous close
- Market capitalization
- Revenue, EBITDA, operating profit, net income
- Total assets, liabilities, debt, cash
- Book value per share, dividend per share, EPS, face value
- Corporate action amounts
- Sector market capitalization and financial-statement line items in crore

**NOT Converted (Ratios, Percentages):**
- P/E, P/B, EV/EBITDA, D/E ratios (inherently currency-neutral)
- ROE, ROA, ROCE percentages
- Profit margins, growth percentages
- Shareholding percentages, employee counts
- Daily price change percent

**Rationale:** Ratios are dimensionless (currency-neutral) and should not be converted. Converting them would create confusion (e.g., a 15% ROE should not become "15% * exchange rate").

### Environment Variables

**Frankfurter uses no configuration.** The provider:
- Queries public Frankfurter API (free tier)
- No authentication required
- No API keys needed
- Automatically available in all environments

The service is included by default and requires no setup.

### Production Considerations

- **Caching**: 6-hour TTL is suitable for intraday trading; consider shorter TTL (30 min to 1 hour) during market volatility
- **Rate Freshness**: Rates updated once per business day by Frankfurter; suitable for display, not for live trading
- **Fallback**: When rates unavailable, frontend displays values in original source currency
- **Alternative Providers**: Easy to swap `FrankfurterExchangeRateProvider` for OpenExchangeRates, XE, or other provider by implementing `ExchangeRateProvider` interface

## Loading & Preloader

When user changes market, country, or currency:

1. `MarketContext.setCountry()` or `setCurrency()` called
2. `loading` flag set to `true`
3. `MarketTransitionLoader` component displayed (fixed overlay, modal-style)
4. Backend preference update persists (`PATCH /api/market/context`)
5. All relevant queries cancelled and refetched
6. `loading` flag set to `false`
7. Overlay disappears

**Loader UI** (`client/src/components/MarketTransitionLoader.tsx`):

Shows a modal with:
- Icon + title "Updating your market"
- Message: "Refreshing data and display preferences..."
- Animated pulse bars

The loader prevents accidental interaction while data is refreshing and creates a sense of an intentional action.

## Favicon

The application favicon is `client/public/marketmind-logo.svg`, referenced by `client/index.html`. The repository did not contain a standalone raster/vector logo asset; this SVG encodes the same rounded violet/indigo tile and white `TrendingUp` mark already used by the Sidebar and market transition UI, without introducing a different logo design.

## Dashboard

The `Dashboard` page (`client/src/pages/Dashboard.tsx`) includes:

- Document count (from `GET /api/dashboard`)
- Watchlist count (from `GET /api/dashboard`)
- Conversation count (from `GET /api/dashboard`)
- Recently viewed companies (fetched via `GET /api/stocks/recently-viewed`)
- Recent activity (from `GET /api/dashboard`)
- Market snapshot / summary (if implemented)

**Backend Endpoint:** `GET /api/dashboard` (authenticated)

Returns:

```json
{
  "documentsCount": 5,
  "watchlistCount": 12,
  "conversationsCount": 8,
  "recentlyViewedCompanies": [
    { "symbol": "TSLA", "company": "Tesla Inc", "market": "US", "viewedAt": "..." }
  ],
  "recentActivity": [...]
}
```

## Trade Journal

**Status: ✅ IMPLEMENTED (recording, review, dashboard, calendar, analytics, and reports)**

The Trade Journal lets a user record trades they have already taken and review them later. It is not a brokerage, portfolio, paper-trading, or order-execution system. MarketMind does not place buy/sell orders, sync broker positions, or manage live holdings.

### Implemented

- Universal `JournalTrade` MongoDB model (one collection for every journal asset class)
- Authenticated CRUD, list, stats, duplicate, overview, calendar, and analytics APIs under `/api/journal`
- Server-side P&L, return percent, risk/reward, and holding duration
- Server-side journal analytics (no browser-side aggregation of full trade history)
- Monthly calendar summaries loaded by year/month only
- Zod validation and user-scoped queries
- Frontend Journal area: Overview dashboard, Trades, Calendar, Reports, Add/Edit, Detail
- Sidebar navigation entry after Stocks
- Instrument search via existing `GET /api/stocks/search` (no provider calls from React)
- Case-insensitive instrument search: queries are trimmed, whitespace-collapsed, and case-folded in `normalizeInstrumentSearchQuery` before any provider is called. Typed UI values stay as the user entered them.
- Manual/custom instrument names when live search has no match
- Reusable `InfoTooltip` field help on Add/Edit Trade
- Predefined Strategy, Setup, and Market Condition dropdowns, plus Custom (persists the custom text, not the word "Custom")
- Backward compatibility: historical free-text values load as Custom + original text
- User-entered Trade Quality (1–5 execution rating, independent of P&L)
- Optional execution notes (journal only; not broker execution)
- Add Trade form sections: Trade, Risk, Journal, Psychology, Review
- Unit tests for P&L, validation, list filters, pagination, user isolation, search normalization, presets/custom values, trade quality, holding duration, calendar aggregation, win rate, streaks, and grouped analytics

### Journal dashboard

`GET /api/journal/overview` powers `/journal`. Cards use recorded trades only:

Total Trades, Winning Trades, Losing Trades, Win Rate, Total Net P&L, Average Trade, Best Trade, Worst Trade.

The performance section adds P&L over time, cumulative P&L, monthly performance, average win/loss, profit factor, expectancy, average return, and win/loss streaks. Metrics that need a sample (profit factor, expectancy, small closed-trade counts) are labeled or shown as `—`. An empty journal shows “You haven't recorded any trades yet” and Add your first trade. Open trades are counted in Total Trades but excluded from P&L, win rate, and streaks. Breakeven (`netPnl === 0`) is neither a win nor a loss.

`GET /api/journal/stats` remains for compatibility (counts and closed-trade net P&L).

### Calendar

- `GET /api/journal/calendar?year=2026&month=8` returns every day of that month plus month totals. Days without trades are `NO_TRADES`; they are not loaded from other months.
- Each day includes trade count, net P&L, wins, losses, breakeven, and outcome: `PROFIT` | `LOSS` | `BREAKEVEN` | `NO_TRADES`.
- Activity is keyed by `entryDate`.
- `GET /api/journal/calendar/day?date=2026-08-31` returns that day's trade list (instrument, direction, entry, exit, P&L, strategy, setup, status) plus day P&L, count, and win rate.
- Frontend `/journal/calendar` supports previous / current / next month. Clicking a day opens the list; a trade opens the existing Trade Detail page.

### Analytics and reports

`GET /api/journal/analytics?report=...` aggregates on the server. Reports: `performance`, `strategy`, `setup`, `assetClass`, `psychology`, `time`, `risk`.

Shared filters (also accepted on `/overview`): `from`, `to`, `assetClass`, `market`, `direction`, `strategy`, `setup`. Date `to` includes the full UTC day.

Frontend `/journal/reports` uses those report categories and filters. Strategy/setup/asset-class tables are sortable. Psychology copy is observational (“Trades tagged FOMO had…”), not causal.

**Supported analytics**

- Strategy / setup: trades, wins, losses, win rate, net P&L, average P&L, best, worst (setup table omits best/worst in the UI)
- Asset class: all journal classes; unused classes show `—`, not 0%
- Psychology: emotion before, plan adherence, mistake tags, confidence buckets
- Time: weekday, month, holding-duration buckets; entry hour only when at least five trades have `entryTime`
- Risk: average planned R:R, average realized return, stop/target coverage, plan adherence, missing-data counts
- Streaks: current and longest win/loss; breakeven resets a streak and is not counted as a win or loss

### Aggregation architecture

Controllers only parse query params and call services. Aggregation lives in:

- `journal.analytics.math.ts` — summaries, streaks, grouping, series
- `journal.analytics.service.ts` — user-scoped load (projection, `entryDate` sort, 5,000-trade cap) and report builders
- `journal.calendar.ts` / `journal.calendar.service.ts` — month grid and day detail
- `journal.service.ts` — CRUD (unchanged Phase 1)

Queries always include `userId` from the session. There is no global cache of private journal data. React Query keys `journal-overview`, `journal-calendar`, and `journal-analytics` are user-session requests only.

### Indexes

`JournalTrade` compound indexes used for list, calendar, and analytics filters:

`userId + entryDate`, `userId + exitDate`, `userId + createdAt`, `userId + status`, `userId + assetClass`, `userId + strategy`, `userId + setup`, `userId + direction`, `userId + symbol`

### Analytics limitations

- Totals sum stored transaction amounts. Mixed currencies are not converted for overview/analytics. Ratios (win rate, return %, R:R) are not currency-converted.
- Analytics load at most 5,000 matching trades per request.
- Profit factor is omitted when there are no losses (or loss P&L is 0). Expectancy is omitted when there are no decided (win/loss) trades.
- Entry-hour analytics are omitted below five timed entries.
- Missing strategy, setup, psychology, stop, or target is shown as unspecified/missing, not invented.

### Planned (not implemented)

- Dedicated Strategy/Setup CRUD collections
- File upload for attachments (metadata fields exist; storage is not wired)
- Currency-normalized overview totals (closed-trade `netPnl` is summed in stored transaction amounts)
- Multi-entry / partial-exit / scale-in-out UI (current model remains one entry + one exit; a future optional `legs[]` can be added without replacing that summary)
- Structured pre-trade checklist UI (current fields `followedPlan`, confidence, stop/target, and thesis are the foundation; no separate checklist collection yet)

### Supported journal asset classes

Equity, ETF, Mutual Fund, Crypto, Option, Future, Commodity, Forex, Bond, REIT / InvIT, Other.

These are journal types only. They do not mean MarketMind can trade those instruments.

### Instrument snapshot

Each entry stores enough identity to remain readable if a symbol, name, or provider id later changes:

`instrumentId` (when known), `symbol`, `displaySymbol`, `instrumentName`, `assetClass`, `market`, `exchange`, `currency`

Provider secrets are not stored. Changing the navbar display currency does not rewrite historical journal amounts.

### P&L rules (backend source of truth)

- LONG closed: `grossPnl = (exitPrice - entryPrice) × quantity`
- SHORT closed: `grossPnl = (entryPrice - exitPrice) × quantity`
- `netPnl = grossPnl - fees`
- `returnPercent = netPnl / (entryPrice × quantity) × 100` when invested amount is greater than zero
- OPEN trades keep exit P&L empty
- Return percent and R:R are ratios and are not currency-converted
- Holding duration is derived from entry/exit timestamps at read time (not user-edited)
- Closed trades: `exit timestamp - entry timestamp`, labeled like `2h 35m` or `3d 4h`
- Open trades: elapsed time only, labeled `Currently open · …`

### Strategy, setup, and market condition

Stored as strings on `JournalTrade`. The Add/Edit form offers predefined options plus Custom.

- Selecting a predefined option persists that label
- Selecting Custom reveals an input and persists the trimmed custom text
- Other is a normal selectable category, not a second custom field
- Existing free-text values that are not in the predefined lists display as Custom with the original value

### Trade quality and execution notes

- `tradeQuality`: optional integer 1–5 for plan/execution quality, never inferred from P&L
- `executionNotes`: optional journal text about fills, delays, or unusual execution conditions
- Neither field places or tracks broker orders

### Validation and security

- Routes use `requireAuth`; `userId` always comes from the session, never the request body
- Quantity must be positive; prices and fees cannot be negative
- CLOSED trades require exit price and exit date; exit date cannot precede entry date
- `tradeQuality` must be an integer 1–5 when supplied
- `strategy`, `setup`, and `marketCondition` remain free strings (max 80) so historical values stay valid
- `executionNotes` max 2000 characters
- Search regex is escaped; list results are paginated (max 50)
- One user cannot read, update, or delete another user's entries

### Frontend routes

| Path | Page |
|------|------|
| `/journal` | Overview dashboard |
| `/journal/trades` | Trade list |
| `/journal/trades/new` | Add trade |
| `/journal/trades/:id` | Trade detail |
| `/journal/trades/:id/edit` | Edit trade |
| `/journal/calendar` | Monthly calendar + day detail |
| `/journal/reports` | Analytics reports + filters |

### Caching / React Query

Journal mutations invalidate `journal-stats`, `journal-overview`, `journal-trades`, `journal-calendar`, `journal-analytics`, and the affected `journal-trade` query. Stock, dashboard, and market-context queries are not refetched. Journal analytics are not stored in a shared server cache.

## Root Structure

- `client/` - React frontend application (Vite + Tailwind CSS)
- `server/` - Express backend API and auth server
- `README.md` - existing project README
- `PROJECT_DOCUMENTATION.md` - this documentation file

## Client Structure

```
client/
  src/
    api/                      # API adapters (auth, stocks, etc.)
    components/
      stock/                  # Stock-specific components
        StockHeader.tsx
        StockSearch.tsx
        FinancialCard.tsx
        NewsCard.tsx
        RecommendationCard.tsx
      journal/
        JournalInstrumentSearch.tsx  # Reuses GET /api/stocks/search
        PresetOrCustomSelect.tsx     # Strategy/setup/condition + Custom
        JournalEmptyState.tsx        # First-trade empty state
        JournalPnlChart.tsx          # SVG P&L bar/line charts
        JournalAnalyticsTable.tsx    # Sortable analytics table
        JournalReportFilters.tsx     # Shared report filters
      ui/                     # Base controls (button, input, etc.)
        InfoTooltip.tsx              # Reusable field help tooltip
      Navbar.tsx              # Top navigation with country/currency selectors
      Sidebar.tsx             # Icon-based navigation menu
      DashboardCard.tsx        # Reusable card layout
      PageHeader.tsx           # Page title/header area
      MarketTransitionLoader.tsx  # Loading overlay during market changes
    config/
      markets.ts              # Country/market/currency registry
      journal.ts              # Journal presets, field help, Custom-value helpers
    context/
      AuthContext.tsx         # JWT + refresh token state
      MarketContext.tsx       # Market preferences + query invalidation
    hooks/
      useAuth.ts              # Hook to access AuthContext
      useMarketContext.ts     # Hook to access MarketContext
      useAsync.ts             # Generic async handling hook
    layouts/
      DashboardLayout.tsx     # Authenticated app shell (Sidebar + Navbar)
      AuthLayout.tsx          # Login/Register split-panel layout
    pages/
      Dashboard.tsx           # Dashboard with metrics and recently viewed
      Stocks.tsx              # Stock research: search, profile, quote, news, recommendation
      journal/
        JournalLayout.tsx     # Journal section shell + subnav
        JournalOverview.tsx   # Journal dashboard, performance, recent entries
        JournalTrades.tsx     # Filtered, paginated trade list
        JournalTradeForm.tsx  # Add / edit recorded trade
        JournalTradeDetail.tsx # Trade review, duplicate, delete
        JournalCalendar.tsx   # Monthly calendar + day trades
        JournalReports.tsx    # Strategy/setup/psychology/time/risk reports
      Login.tsx               # Login form
      Register.tsx            # Registration form
      Watchlist.tsx           # (scaffolded)
      Documents.tsx           # (scaffolded)
      AIChat.tsx              # (scaffolded)
      Settings.tsx            # (scaffolded)
      Profile.tsx             # (scaffolded)
    services/
      api.ts                  # Axios instance with auth cookie interceptor
      auth.ts                 # Auth API calls (login, register, refresh)
      market-context.service.ts # Market preferences API calls
      stock.service.ts        # Stock data API calls
      journal.service.ts      # Trade journal API calls (CRUD, overview, calendar, analytics)
    types/
      index.ts                # TypeScript interfaces (Auth, User, etc.)
    utils/
      currency.ts             # Central monetary display formatting
      journal-metrics.ts      # Journal metric formatting (null → —)
    App.tsx                   # App routing and shell layout
    main.tsx                  # Vite entry point
    styles.css                # Tailwind base layer + custom dark theme
  tailwind.config.js          # Tailwind config with custom ink color palette
  vite.config.ts              # Vite build config
  tsconfig.json               # TypeScript config
  package.json
```

## Server Structure

```
server/
  src/
    config/
      markets.ts              # Market definitions (22 entries, exchanges, provider priority)
      currencies.ts           # Currency registry (18 currencies)
      env.ts                  # Environment variable schema + defaults
    controllers/
      auth.controller.ts      # Login, register, refresh handlers
      stock.controller.ts     # Stock endpoints (search, profile, quote, news, etc.)
      dashboard.controller.ts # Dashboard summary
      journal.controller.ts   # Trade journal CRUD, list, stats, overview, calendar, analytics
    middleware/
      requireAuth.ts          # JWT verification and cookie extraction
      errorHandler.ts         # Error response formatting
      logger.ts               # Request logging
    models/
      User.ts                 # User schema (email, password hash, preferences)
      RecentlyViewed.ts       # Recently viewed stock tracking per user
      Watchlist.ts            # (scaffolded - model only, no endpoints)
      JournalTrade.ts         # Universal trade-journal entry (one model for all asset classes)
      Document.ts             # (scaffolded)
      Conversation.ts         # (scaffolded)
    routes/
      auth.routes.ts          # /auth/* endpoints
      stock.routes.ts         # /api/stocks/* endpoints
      dashboard.routes.ts     # /api/dashboard
      market-context.routes.ts # /api/market/context
      journal.routes.ts       # /api/journal/*
    services/
      auth.service.ts         # Credential validation, token generation, refresh logic
      stock.service.ts        # Aggregates market data and records views
      market-context.service.ts # User preference persistence and retrieval
      journal/
        journal.service.ts    # Authenticated, user-scoped journal CRUD
        journal.analytics.service.ts # Overview and report aggregation
        journal.analytics.math.ts    # Win rate, streaks, grouping, series
        journal.calendar.service.ts  # Month query and day detail
        journal.calendar.ts          # Daily calendar grid
        journal.pnl.ts        # Server-side P&L, return %, and R:R
        journal.query.ts      # List filters, escaped search, pagination
        journal.duration.ts   # Derived holding duration labels
        journal.presets.ts    # Custom vs predefined string resolution
      market-data/
        marketData.service.ts # High-level API (search, profile, quote, news, recommendation)
        marketData.providerResolver.ts # Selects best provider by market
        marketData.types.ts   # Normalized types (all providers conform)
        marketData.normalizer.ts # Normalization functions (Finnhub → normalized)
        instrumentSearch.service.ts # Multi-provider instrument search and deduplication
        instrumentSearch.query.ts # Case-insensitive search query normalization
        providers/
          finnhub/
            finnhub.provider.ts     # Finnhub provider implementation
          upstox/
            upstox.provider.ts      # Upstox Indian research implementation
            upstox.instrument.service.ts # ISIN resolution and caching
          twelveData/
            twelveData.provider.ts  # Twelve Data scaffolding (🔶 NOT CONFIGURED)
      currency/
        currency.service.ts   # Currency conversion service
        currency.types.ts     # ExchangeRateProvider interface
        frankfurter.provider.ts # Real-time Frankfurter exchange-rate provider (✅ OPERATIONAL)
    types/
      index.ts                # Shared TypeScript interfaces
      journal.ts              # Journal asset classes, input/record types
    validators/
      journal.validators.ts   # Zod schemas for create, update, list, calendar, analytics
    utils/
      jwt.ts                  # Token encode/decode utilities
      password.ts             # bcryptjs hashing utilities
      validation.ts           # Field validators
    app.ts                    # Express app setup (CORS, routes, error handlers)
    server.ts                 # HTTP server startup (listening on port)
  .env.example                # Environment variable template
  package.json
  tsconfig.json               # TypeScript config
```

## Authentication

### Cookie-Based JWT Flow

1. **Login** (`POST /auth/login`):
   - User submits email + password
   - Backend verifies credentials against User.password (bcryptjs)
   - If valid:
     - Create access token (JWT, 15-minute TTL)
     - Create refresh token (opaque string, hashed, 30-day TTL)
     - Set httpOnly cookies: `accessToken`, `refreshToken` (not accessible via JavaScript)
   - Return success response with user info

2. **Protected Route Access**:
   - Frontend axios interceptor attaches cookies automatically
   - Backend middleware (`requireAuth`) verifies JWT from `accessToken` cookie
   - If valid, extract user ID and continue
   - If expired, request interceptor catches 401 and calls refresh endpoint

3. **Token Refresh** (`POST /auth/refresh`):
   - Backend validates `refreshToken` cookie
   - If valid:
     - Rotate refresh token (create new one, hash, replace old)
     - Issue new access token (15-minute TTL)
     - Set new httpOnly cookies
   - Return success
   - **If refresh fails (invalid/expired):** return 401 → frontend redirects to login

4. **Logout** (`POST /auth/logout`):
   - Clear httpOnly cookies
   - Return success

### Why httpOnly Cookies?

- Not accessible via JavaScript (prevents XSS leakage)
- Automatically sent by browser on every request (no manual header management)
- Can be set as `Secure` + `SameSite=Strict` in production

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new account |
| POST | `/auth/login` | ❌ | Login, get access + refresh tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token (uses refreshToken cookie) |
| POST | `/auth/logout` | ✅ | Logout, clear cookies |

### Market Context

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/market/context` | ✅ | Get user's market preferences + supported markets/currencies |
| PATCH | `/api/market/context` | ✅ | Update market, country, or currency preference |

### Stock Data

| Method | Endpoint | Auth | Query Params | Description |
|--------|----------|------|--------------|-------------|
| GET | `/api/stocks/search` | ✅ | `q`, `market?`, `currency?` | Search companies by name/symbol |
| GET | `/api/stocks/recently-viewed` | ✅ | | Get 5 most recent viewed companies |
| GET | `/api/stocks/:symbol/profile` | ✅ | `market?`, `currency?` | Get company profile and metadata |
| GET | `/api/stocks/:symbol/quote` | ✅ | `market?`, `currency?` | Get current price and intraday metrics |
| GET | `/api/stocks/:symbol/news` | ✅ | `market?`, `currency?` | Company news via the News Service (Marketaux primary) |
| GET | `/api/stocks/:symbol/recommendation` | ✅ | `market?`, `currency?` | Get analyst buy/hold/sell recommendation |
| GET | `/api/stocks/:symbol` | ✅ | `market?`, `currency?` | Composite: profile + quote + news + recommendation |
| GET | `/api/stocks/:symbol/fundamentals` | ✅ | `market?`, `currency?` | Normalized company overview, benchmarked ratios, and per-share metrics |
| GET | `/api/stocks/:symbol/statements` | ✅ | `market?`, `currency?`, `type?`, `period?` | Income statement, balance sheet, and cash flow |
| GET | `/api/stocks/:symbol/shareholding` | ✅ | `market?`, `currency?` | Quarterly shareholding history |
| GET | `/api/stocks/:symbol/corporate-actions` | ✅ | `market?`, `currency?` | Dividends, bonus issues, splits, and rights |
| GET | `/api/stocks/:symbol/competitors` | ✅ | `market?`, `currency?` | Provider-reported peer companies |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard` | ✅ | Dashboard summary (document count, watchlist count, recent activity) |

### Trade Journal

All journal routes require authentication. Every query is scoped to `req.user.id`. The client never supplies `userId`, and MarketMind does not place, execute, or synchronize broker orders.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/journal/overview` | ✅ | Dashboard cards, performance, streaks, P&L series (optional analytics filters) |
| GET | `/api/journal/analytics` | ✅ | Server-side report: `performance` \| `strategy` \| `setup` \| `assetClass` \| `psychology` \| `time` \| `risk` |
| GET | `/api/journal/calendar` | ✅ | Daily summaries for `year` + `month` (1–12) |
| GET | `/api/journal/calendar/day` | ✅ | Trades and totals for one `date` (`YYYY-MM-DD`) |
| GET | `/api/journal/stats` | ✅ | Compatibility counts, closed-trade net P&L sum, win rate |
| GET | `/api/journal/trades` | ✅ | Paginated, filtered list (`items`, `page`, `limit`, `total`, `totalPages`) |
| POST | `/api/journal/trades` | ✅ | Create a recorded journal trade; server calculates financials |
| GET | `/api/journal/trades/:id` | ✅ | Get one trade owned by the authenticated user |
| PATCH | `/api/journal/trades/:id` | ✅ | Update a trade; merged payload is revalidated and financials recalculated |
| DELETE | `/api/journal/trades/:id` | ✅ | Delete a trade owned by the authenticated user |
| POST | `/api/journal/trades/:id/duplicate` | ✅ | Copy an existing entry as a new journal trade |

**List filters:** `search`, `assetClass`, `market`, `direction`, `status`, `strategy`, `setup`, `tags`, `from`, `to`, `outcome` (`profitable` \| `losing`), `sort`, `order`, `page`, `limit` (max 50).

**Analytics / overview filters:** `from`, `to`, `assetClass`, `market`, `direction`, `strategy`, `setup`. Calendar uses `year` and `month` only so the browser does not download the full journal.

### Environment Variables

**Frontend** (`client/.env`):

```
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=MarketMind
```

**Backend** (`server/.env`):

```
# Core
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/marketmind

# Authentication
JWT_SECRET=your-secret-key-here
ACCESS_TOKEN_TTL_MINUTES=15        # optional, default 15
REFRESH_TOKEN_TTL_DAYS=30          # optional, default 30

# Finnhub (required for Finnhub-backed market-data capabilities)
FINNHUB_API_KEY=<your-finnhub-api-key>

# Marketaux (primary financial news provider)
MARKETAUX_API_KEY=<your-marketaux-api-key>

# Market Provider Selection (optional; controls intelligent provider routing)
MARKET_PROVIDER_DEFAULT=finnhub    # global fallback provider
MARKET_PROVIDER_IN=upstox          # India-specific provider (upstox preferred, finnhub fallback)
MARKET_PROVIDER_US=finnhub         # US-specific provider (finnhub or twelveData)

# Upstox (India market data provider - search, quote, profile, fundamentals)
UPSTOX_API_KEY=<your-upstox-api-key>
UPSTOX_API_SECRET=<your-upstox-api-secret>
UPSTOX_ACCESS_TOKEN=<your-upstox-oauth-token>

# Twelve Data (optional; global alternative provider - not yet implemented)
# TWELVE_DATA_API_KEY=<your-twelve-data-key>

# Frontend Origin (for CORS)
FRONTEND_ORIGIN=http://localhost:5173

# Currency Conversion (Frankfurter - automatic, no configuration needed)
# Exchange rates fetched from https://api.frankfurter.dev/v2 (public API)

# Cookies (development vs production)
COOKIE_SECURE=false                # true in production (HTTPS only)
COOKIE_SAME_SITE=Lax               # Strict in production
```

**Notes:**
- Provider selection environment variables are optional; if not set, the provider resolver falls back to market preferences and then Finnhub
- Frankfurter currency conversion is automatic and requires no setup (public free API)
- All credentials (API keys, tokens, secrets) must be kept in `.env` and never committed to version control
- Do not include any secrets, tokens, or credentials in code or documentation

## Security Considerations

### Implemented

- ✅ **httpOnly Cookies**: Access and refresh tokens cannot be read via JavaScript
- ✅ **CORS Whitelist**: Backend allows only specified frontend origins
- ✅ **Password Hashing**: bcryptjs with salt rounds (10)
- ✅ **Refresh Token Rotation**: New refresh token issued on every refresh; old token invalidated
- ✅ **Protected Routes**: All API endpoints require valid JWT
- ✅ **Journal user isolation**: journal queries are scoped to the authenticated user; malformed ids are rejected
- ✅ **Environment Variables**: Secrets kept out of version control

### Recommended for Production

- 🔲 **HTTPS Only**: Set `COOKIE_SECURE=true` and use HTTPS
- 🔲 **CSRF Protection**: Add CSRF token for state-changing requests
- 🔲 **Rate Limiting**: Implement rate limiter on auth and API endpoints
- 🔲 **Audit Logging**: Log all sensitive operations (login, preference changes)
- 🔲 **Input Validation**: Stricter validation on all inputs
- 🔲 **SQL/NoSQL Injection Prevention**: Already handled by Mongoose, but audit queries

## Running the Project

### Prerequisites

- Node.js 16+
- npm (or yarn, pnpm)
- MongoDB (local or cloud URI)

### Setup

1. Clone repository:
   ```bash
   git clone <repo-url>
   cd MarketMind
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create `server/.env` from `server/.env.example`
   - Fill in `FINNHUB_API_KEY`, `MONGODB_URI`, `JWT_SECRET`
   - Create `client/.env` from template (or use defaults)

4. Start MongoDB:
   ```bash
   # Local MongoDB
   mongod

   # Or via Docker
   docker run -d -p 27017:27017 mongo:latest
   ```

5. Start backend (from project root):
   ```bash
   npm run server:dev
   ```
   Backend runs on `http://localhost:5000`.

6. Start frontend (in another terminal, from project root):
   ```bash
   npm run client:dev
   ```
   Frontend runs on `http://localhost:5173`.

7. Open browser to `http://localhost:5173` and log in.

### Scripts

**Root** (`package.json` workspaces):

```bash
npm install           # Install all workspaces
npm run client:dev    # Start frontend dev server
npm run server:dev    # Start backend dev server
npm run build         # Build both workspaces
npm run lint          # Lint both workspaces
```

## Known Gaps & Future Work

### Partially Implemented

1. **Upstox Provider**: Indian research capabilities are implemented with upstream coverage limits.
   - ✅ Implemented: Search, quote, profile, benchmarked ratios, financial statements, shareholding, corporate actions, and competitors
   - ❌ Missing: Analyst recommendations via Upstox (Finnhub is attempted for that capability)
   - Indian and global company news use the News Service (Marketaux primary, Finnhub fallback)
   - ❌ Missing: Historical price-series data
   - ❌ Missing: Options/derivatives data
   - Future: Add providers for news, recommendations, and historical prices

2. **Watchlist Model**: Database schema exists; backend endpoints and frontend UI not implemented.
   - ✅ Done: Watchlist model defined in `server/src/models/Watchlist.ts`
   - ❌ Missing: REST API endpoints (GET, POST, DELETE)
   - ❌ Missing: Frontend UI for add/remove/view
   - ❌ Missing: Integration with stock detail pages
   - Future: Implement full CRUD operations and frontend components

### Not Yet Implemented

1. **Twelve Data Integration**: Provider scaffolded but not configured.
   - Requires: API credential setup and configuration
   - Requires: Implementation of search, profile, quote, news, recommendation methods
   - Requires: Normalizer functions for Twelve Data payloads
   - Use Case: Global alternative to Finnhub for redundancy and coverage

2. **Documents & Upload**: Pages scaffolded; backend not implemented.
   - Requires: File upload infrastructure
   - Requires: Document storage (S3, GCS, or local)
   - Requires: Document retrieval and list endpoints
   - Requires: Frontend UI for upload/management

3. **AI Chat Feature**: Pages scaffolded; backend not implemented.
   - Requires: LLM integration (OpenAI, Claude, local model)
   - Requires: Conversation persistence
   - Requires: Context injection (current stock, market data, etc.)
   - Requires: Frontend chat UI components

4. **Advanced Search Filters**: Currently only supports symbol/name search.
   - Requires: Sector filtering
   - Requires: Market cap range filtering
   - Requires: Price range filtering
   - Requires: Exchange filtering
   - Implementation: Depends on provider capabilities

5. **Portfolio Tracking**: No portfolio or holdings management.
   - Requires: Portfolio model and database schema
   - Requires: Purchase/sale transaction logging
   - Requires: Performance calculation
   - Requires: Allocation visualization

6. **Alerts & Notifications**: No price alerts or notifications.
   - Requires: Alert rule model
   - Requires: Background job for monitoring
   - Requires: Push/email notification infrastructure
   - Requires: Frontend notification UI

7. **Mobile Optimization**: Research tables are horizontally scrollable and cards are responsive, but full device/browser QA remains outstanding.

8. **Historical Price Data & Charts**: Fundamentals history is available, but historical market-price charting is not implemented.
   - Requires: Time-series data storage
   - Requires: Data aggregation from providers
   - Requires: Chart components (candlestick, line, etc.)
   - Data Source: Extended Finnhub, Upstox, or dedicated provider

### Infrastructure Improvements

1. **Rate Limiting**: Authentication endpoints have basic rate limiting; consider comprehensive rate limiting across all endpoints
2. **Caching Strategy**: Market data cached by provider; consider additional caching layers (Redis)
3. **Background Jobs**: No async job queue; consider for bulk updates, data aggregation
4. **Monitoring & Logging**: Basic request logging; add structured logging and performance monitoring
5. **Error Tracking**: No error tracking service; consider Sentry or similar
6. **Testing**: Trade Journal unit tests run via `npm test` in `server/` (`tsx --test src/services/journal/*.test.ts` plus market-data tests). Coverage includes P&L, calendar days, monthly P&L, win rate, strategy/setup/asset/psychology aggregation, streaks, empty/open trades, user isolation, and date/analytics filters. Broader integration and e2e coverage is still planned.
7. **API Documentation**: OpenAPI/Swagger documentation not generated

### Known Limitations

- **Upstox News & Recommendations**: Upstox does not provide news or recommendations; company news uses Marketaux, and recommendations still attempt Finnhub
- **Currency Conversion Freshness**: Frankfurter rates updated daily; not suitable for intraday precision (consider shorter cache TTL)
- **Finnhub Rate Limits**: Finnhub free tier has rate limits; no queuing or priority logic implemented
- **No Real-Time Data**: All data from APIs; no WebSocket or streaming updates
- **Authentication Only**: No role-based access control (RBAC); all authenticated users have same permissions
- **Global metadata**: Finnhub symbol search does not return exchange/country/currency/ISIN for every result; unavailable fields remain `null`
- **Country coverage**: all 22 entries are selectable registry entries, but only India (Upstox) and US profile/quote paths were live-tested in this change
- **Upstox token lifecycle**: the development access token is read from server environment configuration; automatic renewal is not implemented
- **Indian market capitalization**: Upstox's company-profile fundamentals response supplies sector market capitalization, not a company market cap, so MarketMind does not substitute or fabricate that value
- **Per-share/company metrics**: basic EPS and latest dividend amount come from provider data; book value, dividend yield, and face value are derived only when price, P/B, dividend amount, and dividend percent are all present; shares outstanding and reliable company debt remain unavailable

## Current Status

### Implemented

**Authentication & Security:**
- React + Vite frontend with TypeScript and Tailwind CSS
- Express + TypeScript backend with MongoDB persistence
- Cookie-based authentication: login, register, refresh, logout with httpOnly cookies
- JWT tokens with 15-minute TTL and rotating refresh tokens (30-day TTL)
- Protected routes and API endpoints with middleware auth guards
- CORS configuration for frontend/backend communication
- Password hashing with bcryptjs

**Market Data & Providers:**
- Finnhub provider: search, profile, quote, and recommendation implemented; US profile/quote paths live-verified
- News Service: Marketaux primary, Finnhub fallback; normalized `NewsItem` returned from `GET /api/stocks/:symbol/news`
- Multi-provider architecture with resolver and fallback logic
- Normalized data types enforced across all providers
- Instrument search service with deduplication (up to 20 results)
- Market/currency context in every request

**User Experience:**
- User market preferences (country, market, currency) with database persistence
- 22 configured country/market entries with capability-aware provider selection
- Market context frontend with automatic query refetch on preference change
- Market transition loader overlay during context changes
- Navbar country/currency selectors with flags
- Recently viewed stock history per user (up to 5 items)
- Stock search with autocomplete dropdown (300ms debounce)

**Stock Intelligence:**
- Stock data endpoints: search, profile, quote, news, recommendation, composite, fundamentals, statements, shareholding, corporate actions, and competitors
- Indian research UI: key metrics, valuation, profitability, company overview, financial performance, balance sheet, cash flow, shareholding history, corporate actions, and competitors
- Derived per-share metrics are labeled; company market cap remains `Not available` when Upstox does not supply it
- Annual/quarterly income and consolidated/standalone controls; balance sheet and cash flow remain annual as defined by Upstox
- Dashboard summary with counts and recently viewed companies
- Dashboard quick-access to various sections

**Trade Journal:**
- Universal `JournalTrade` model with instrument snapshot and asset-specific optional details
- Authenticated journal APIs: create, list (filtered + paginated), get, update, delete, duplicate, stats, overview, calendar, analytics
- Server-side P&L for LONG/SHORT, fees, open/closed validation, and escaped search
- Server-side dashboard, calendar, and report aggregation scoped to the authenticated user
- Journal UI: Overview dashboard, Trades, Calendar, Reports, Add/Edit, Detail; Sidebar Journal item
- Reuses existing stock search and market/currency context; historical amounts stay in transaction currency

**Currency Conversion:**
- Centralized display-currency conversion via Frankfurter reference rates
- 6-hour cache with intelligent request deduplication
- Support for 18+ currencies across configured markets
- Monetary vs. ratio distinction (ratios not converted)
- Graceful fallback when rates unavailable

### Implemented with provider limitations

**Upstox Provider (India Market Data):**
- ✅ Search: Full implementation via dedicated instrument service
- ✅ Quote: Live NSE/BSE market data
- ✅ Profile: Company profile with fundamental data via ISIN
- ✅ Fundamentals: Benchmarked ratios, company overview, financial statements, ownership history, corporate actions, and competitors
- ✅ Instrument Resolution: Symbol-to-ISIN mapping with caching
- ❌ News: Not available from Upstox (fallback to Finnhub)
- ❌ Recommendations: Not available from Upstox (fallback to Finnhub)

**Watchlist:**
- ✅ Model defined and database schema ready
- ❌ API endpoints not implemented
- ❌ Frontend UI not implemented

### Prepared

- **Twelve Data Provider**: Skeleton present, not configured; awaits implementation
- **Documents Feature**: UI pages exist; backend upload/storage not implemented
- **AI Chat Feature**: UI pages exist; backend integration not implemented

### Planned / not yet implemented

- Portfolio tracking and holdings management
- Price alerts and notifications
- Advanced search filters (sector, market cap, etc.)
- Mobile responsive optimization
- Historical data and charting
- Real-time data streams (WebSocket)
- Role-based access control (RBAC)
- Comprehensive test suite beyond the Trade Journal unit tests
- OpenAPI/Swagger documentation
- Journal strategy CRUD, attachment uploads, and currency-normalized journal totals

### Operational Metrics

- **Supported Markets**: 22 (IN, US, GB, CA, AU, JP, CN, HK, SG, CH, KR, BR, MX, ZA, AE, SA, NZ, DE, FR, NL, ES, IT)
- **Supported Currencies**: 18 (INR, USD, GBP, CAD, AUD, JPY, CNY, HKD, SGD, CHF, KRW, BRL, MXN, ZAR, AED, SAR, NZD, EUR)
- **Exchange Coverage**: NSE, BSE (India); NASDAQ, NYSE, AMEX (US); plus exchanges for 19 additional countries
- **Max Search Results**: 20 deduplicated results
- **Recently Viewed Limit**: 5 most recent per user
- **Access Token TTL**: 15 minutes
- **Refresh Token TTL**: 30 days
- **Currency Conversion Cache**: 6 hours

### Verification performed (31 August 2026 — Trade Journal dashboard, calendar, analytics)

- Backend TypeScript compile: passed (`npx tsc -p tsconfig.json --noEmit`)
- Frontend TypeScript check and Vite production build: passed
- Journal backend and frontend ESLint: passed
- Server unit tests via `npm test`: 64 passed (journal analytics/calendar/CRUD plus market-data search tests)
- Watchlist remains model/UI scaffold only; it is not part of the Trade Journal
- Interactive browser walkthrough was not available in this session; journal routes are wired in `AppRoutes.tsx` and the Sidebar

### Verification performed (31 August 2026 — Trade Journal)

- Backend TypeScript compile: passed (`npx tsc -p tsconfig.json --noEmit`)
- Frontend TypeScript check and Vite production build: passed
- Journal backend and frontend ESLint: passed
- Journal unit tests: 23 passed via `server` `npm test` (P&L, validation, filters, pagination, create/update/list/delete scoping, user isolation)
- Watchlist remains model/UI scaffold only; it is not part of the Trade Journal
- Interactive browser walkthrough was not available in this session; journal routes are wired in `AppRoutes.tsx` and the Sidebar

### Verification performed (29 August 2026)

- Backend TypeScript compile: passed
- Frontend TypeScript check and Vite production build: passed
- Backend ESLint: passed (ESLint emitted only its legacy eslintrc deprecation notice)
- Frontend ESLint: passed (same configuration notice)
- Earlier in this implementation, live Upstox checks passed for HDFCBANK, HDFCLIFE, RELIANCE, TCS, and INFY: trusted ISIN resolution, quote, profile, benchmarked ratios, statements, shareholding, corporate actions, and competitors via instrument key
- A later live Upstox re-check in the same session received HTTP 401 from the instrument search API, so newly added derived per-share fields were verified with a fixture using those earlier live values rather than a second live Upstox pass
- Fixture check: book value = price / P/B, face value = dividend / (dividend% / 100), dividend yield = dividend / price; P/E unchanged across INR→USD; EPS conversion status `converted`
- Live Finnhub profile/quote checks passed for AAPL, TSLA, and NVDA; all three returned `not-supported` fundamentals and no longer route to Upstox
- Browser login and visual Stocks-page walkthrough were not interactively verified in this session because no browser automation tools were available

## Notes

### Architecture & Design Decisions

- **Multi-Market by Default**: 22 country/market entries are configured; adding a market requires registry data and an actually capable provider
- **Provider Abstraction**: Frontend never sees raw provider responses; only normalized `SearchResult`, `CompanyProfile`, `PriceData`, etc.
- **Intelligent Fallback**: Finnhub always available as final fallback; graceful degradation if primary provider unavailable
- **Instrument Resolution**: Upstox uses ISIN-based addressing for India; symbol-to-ISIN mapping done by dedicated service with caching
- **Currency Conversion**: Server-side only; frontend receives pre-converted values in `ConvertedMonetaryValue` structure with full context
- **Search Deduplication**: By `symbol::exchangeCode` pair; prevents duplicates across providers while preserving market-specific variants
- **Market Context Validation**: Country and market are separate persisted fields and are validated against the registry's configured relationship

### Key Implementation Details

- **Frankfurter Integration**: Public API, no setup required; 6-hour cache with concurrent request deduplication prevents rate-limit issues
- **Upstox Caching**: 5-minute search cache, 12-hour resolution cache, and 4-hour fundamentals resource cache with in-flight request deduplication
- **Query Invalidation**: When market/currency changes, all stock-related queries refetched; prevents stale data across context switches
- **Recently Viewed**: Upsert-on-view pattern (update timestamp if exists, create if new); backend is source of truth
- **Market Provider Selection**: Environment-driven (`MARKET_PROVIDER_IN`, `MARKET_PROVIDER_US`) for deployment-time config without code changes
- **Indian recommendations**: Upstox does not provide analyst recommendations; Finnhub is attempted and may return no data for an Indian symbol
- **News coverage**: Marketaux free-plan responses are limited to a small page size; empty lists are valid when no relevant articles exist

### Normalization Examples

**Search Result Deduplication:**
```
Finnhub: { symbol: "INFY", exchange: "NSE", market: "US" }   (US listing of India stock)
Upstox:  { symbol: "INFY.NS", exchange: "NSE", market: "IN" } (India NSE listing)
Result:  Only first deduplicated by "INFY::NSE" key
```

**Currency Conversion Rules:**
```
Stock price in USD, user currency in INR:
- sourceCurrency: USD
- displayCurrency: INR
- convertedValue: fetched from Frankfurter
- conversionStatus: 'converted'

P/E ratio in any currency:
- NOT converted (dimensionless ratio)
- displayedAs-is regardless of user currency
```

### Security & Privacy

- **No Provider Credentials Exposed**: provider access tokens and authorization headers remain server-side; normalized research identity may include a non-secret instrument key for unambiguous instrument identity
- **Credentials Server-Side Only**: Finnhub, Upstox, Frankfurter credentials never exposed to frontend
- **httpOnly Cookies**: Auth tokens inaccessible to JavaScript; resistant to XSS attacks
- **Normalized Responses**: Frontend components never directly call provider APIs; isolation prevents API key leakage
- **No Secrets in Code**: All credentials in `.env` file, gitignored

### Performance Optimizations

- **Search Result Limit**: 20 results (not unlimited) prevents large payloads
- **Caching Layers**:
  - Search results: 5 minutes (Upstox)
  - Symbol resolution: 12 hours (Upstox)
  - Fundamentals resources: 4 hours (Upstox)
  - Currency rates: 6 hours (Frankfurter)
  - Concurrent request deduplication (Frankfurter)
- **Query Debouncing**: 300ms frontend search debounce reduces API calls during typing
- **Deduplication**: Prevents redundant results across providers

### Error Handling

- **Provider Unavailable**: If primary provider fails, resolver tries next in preference list, finally falls back to Finnhub
- **Rate Conversion Failure**: Returns value in source currency with `conversionStatus: 'unavailable'`
- **Search Provider Failure**: Consolidated error from first failed provider; if any provider succeeds, error suppressed
- **Graceful Degradation**: independent section endpoints and `SectionAvailability` keep a failed fundamentals category from removing quote/profile or other available research sections

### Testing Recommendations

- **Unit Tests**: Provider implementations, normalizers, currency conversion
- **Integration Tests**: End-to-end stock search with multiple providers, market context changes
- **E2E Tests**: Complete user flows (search → view → change currency → refresh)
- **Mock Data**: Create fixtures for each provider response type
- **Edge Cases**: Empty results, rate unavailability, market code mismatches
