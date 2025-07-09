import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import type {
  Purchase,
  SymbolSuggestion,
  SymbolSearchParams,
  CreatePurchaseRequest,
  DashboardData,
  ChartData,
  ApiError,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChartPeriod,
  User,
} from "./models";

export const stockApi = createApi({
  reducerPath: "stockApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api`
      : "/api",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");

      // Add auth token to headers if available
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
    // Enhanced error handling
    validateStatus: (response, result) => {
      return response.status === 200 && !result?.error;
    },
  }),
  tagTypes: ["Purchase", "Portfolio", "Stock", "Auth", "User"],
  // Keep cached data for 5 minutes
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User", "Purchase", "Portfolio"],
    }),

    changePassword: builder.mutation<
      void,
      { currentPassword: string; newPassword: string }
    >({
      query: (passwords) => ({
        url: "/auth/change-password",
        method: "POST",
        body: passwords,
      }),
    }),

    // Purchase endpoints
    createPurchase: builder.mutation<Purchase, CreatePurchaseRequest>({
      query: (purchase) => ({
        url: "/purchases",
        method: "POST",
        body: purchase,
      }),
      invalidatesTags: ["Purchase", "Portfolio", "Stock"],
      // Optimistic update for better UX
      async onQueryStarted(purchase, { dispatch, queryFulfilled }) {
        // Optimistically update the purchases list
        const patchResult = dispatch(
          stockApi.util.updateQueryData("getPurchases", undefined, (draft) => {
            const optimisticPurchase: Purchase = {
              id: `temp-${Date.now()}`,
              ...purchase,
            };
            draft.unshift(optimisticPurchase);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert the optimistic update on error
          patchResult.undo();
        }
      },
    }),

    getPurchases: builder.query<Purchase[], void>({
      query: () => "/purchases",
      providesTags: ["Purchase"],
      // Transform response to ensure proper number types
      transformResponse: (response: Purchase[]) => {
        return response.map((purchase) => ({
          ...purchase,
          pricePerShare: Number(purchase.pricePerShare),
          commission: Number(purchase.commission),
        }));
      },
    }),

    getPurchaseById: builder.query<Purchase, string>({
      query: (id) => `/purchases/${id}`,
      providesTags: (_, __, id) => [{ type: "Purchase", id }],
    }),

    updatePurchase: builder.mutation<
      Purchase,
      { id: string; data: CreatePurchaseRequest }
    >({
      query: ({ id, data }) => ({
        url: `/purchases/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Purchase", "Portfolio", "Stock"],
    }),

    deletePurchase: builder.mutation<void, string>({
      query: (id) => ({
        url: `/purchases/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Purchase", "Portfolio", "Stock"],
    }),

    getPurchasesBySymbol: builder.query<Purchase[], string>({
      query: (symbol) => `/purchases/symbol/${symbol}`,
      providesTags: (_, __, symbol) => [
        { type: "Purchase", id: `symbol-${symbol}` },
      ],
    }),

    getPurchasesByDateRange: builder.query<
      Purchase[],
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: "/purchases/date-range",
        params: { startDate, endDate },
      }),
      providesTags: ["Purchase"],
    }),

    getRecentPurchases: builder.query<Purchase[], number>({
      query: (limit = 10) => ({
        url: "/purchases/recent",
        params: { limit },
      }),
      providesTags: ["Purchase"],
    }),

    getUserSymbols: builder.query<string[], void>({
      query: () => "/purchases/symbols",
      providesTags: ["Purchase"],
    }),

    // Portfolio/Dashboard endpoint
    getDashboard: builder.query<DashboardData, void>({
      query: () => "/purchases/portfolio",
      providesTags: ["Portfolio"],
      transformResponse: (response: any) => ({
        totalSpent: Number(response.totalSpent),
        totalValue: Number(response.totalValue),
        profitLoss: Number(response.profitLoss),
        profitLossPercentage: Number(response.profitLossPercentage),
        positions: response.positions.map((position: any) => ({
          symbol: position.symbol,
          quantity: Number(position.quantity),
          currentPrice: Number(position.currentPrice),
          currentValue: Number(position.currentValue),
          totalSpent: Number(position.totalSpent),
          totalCommission: Number(position.totalCommission),
          profitLoss: Number(position.profitLoss),
          profitLossPercentage: Number(position.profitLossPercentage),
          purchaseCount: Number(position.purchaseCount),
          firstPurchaseDate: position.firstPurchaseDate,
          lastPurchaseDate: position.lastPurchaseDate,
        })),
      }),
    }),

    // Stock endpoints
    getStockPrice: builder.query<
      { symbol: string; price: number; lastUpdated: string },
      string
    >({
      query: (symbol) => `/stocks/${symbol}/price`,
      providesTags: (_, __, symbol) => [
        { type: "Stock", id: `price-${symbol}` },
      ],
    }),

    getMultipleStockPrices: builder.mutation<
      Array<{ symbol: string; price: number; lastUpdated: string }>,
      string[]
    >({
      query: (symbols) => ({
        url: "/stocks/prices",
        method: "POST",
        body: symbols,
      }),
    }),

    getStockChart: builder.query<
      ChartData,
      { symbol: string; period?: ChartPeriod }
    >({
      query: ({ symbol, period = "1M" }) => ({
        url: `/stocks/${symbol}/chart`,
        params: { period },
      }),
      providesTags: (_, __, { symbol, period }) => [
        { type: "Stock", id: `chart-${symbol}-${period}` },
      ],
      // Transform response to construct ChartData from backend price data
      transformResponse: (response: any, _, arg) => {
        // Backend returns List<PricePoint>, need to construct ChartData
        const priceData = Array.isArray(response) ? response : [];

        return {
          symbol: arg.symbol,
          period: arg.period || "1M",
          priceData: priceData.map((point: any) => ({
            date: point.date,
            price: Number(point.price),
            volume: point.volume ? Number(point.volume) : undefined,
          })),
          purchasePoints: [], // Will be populated by frontend logic if needed
        };
      },
      // Keep chart data cached longer (10 minutes)
      keepUnusedDataFor: 600,
    }),

    getStockHistory: builder.query<
      Array<{ symbol: string; price: number; date: string }>,
      { symbol: string; startDate: string; endDate: string }
    >({
      query: ({ symbol, startDate, endDate }) => ({
        url: `/stocks/${symbol}/history`,
        params: { startDate, endDate },
      }),
      providesTags: (_, __, { symbol }) => [
        { type: "Stock", id: `history-${symbol}` },
      ],
    }),

    getLatestStockData: builder.query<
      { symbol: string; price: number; lastUpdated: string },
      string
    >({
      query: (symbol) => `/stocks/${symbol}/latest`,
      providesTags: (_, __, symbol) => [
        { type: "Stock", id: `latest-${symbol}` },
      ],
    }),

    checkStockDataExists: builder.query<
      boolean,
      { symbol: string; date: string }
    >({
      query: ({ symbol, date }) => ({
        url: `/stocks/${symbol}/exists`,
        params: { date },
      }),
    }),

    getAllStockSymbols: builder.query<string[], void>({
      query: () => "/stocks/symbols",
      providesTags: ["Stock"],
    }),

    // Symbol search endpoint
    searchSymbols: builder.query<SymbolSuggestion[], SymbolSearchParams>({
      query: ({ q, limit = 10 }) => ({
        url: "/stocks/search",
        params: { query: q, limit },
      }),
      // Keep search results cached for 5 minutes
      keepUnusedDataFor: 300,
      // Don't cache empty query results
      transformResponse: (response: SymbolSuggestion[], _, arg) => {
        if (!arg.q.trim()) return [];
        return response;
      },
    }),

    // Stock details endpoint removed - use getPurchasesBySymbol + getStockPrice instead

    // Admin endpoints
    getStockStatistics: builder.query<Record<string, any>, void>({
      query: () => "/stocks/statistics",
      providesTags: ["Stock"],
    }),

    updateStockDataBulk: builder.mutation<
      { totalSymbols: number; updatedCount: number; message: string },
      string[]
    >({
      query: (symbols) => ({
        url: "/stocks/update",
        method: "POST",
        body: symbols,
      }),
      invalidatesTags: ["Stock"],
    }),

    cleanupOldStockData: builder.mutation<
      { deletedCount: number; daysToKeep: number; message: string },
      number
    >({
      query: (daysToKeep = 365) => ({
        url: "/stocks/cleanup",
        method: "DELETE",
        params: { daysToKeep },
      }),
      invalidatesTags: ["Stock"],
    }),

    evictStockPriceCache: builder.mutation<void, string>({
      query: (symbol) => ({
        url: `/stocks/${symbol}/cache/price`,
        method: "DELETE",
      }),
    }),

    evictStockChartCache: builder.mutation<
      void,
      { symbol: string; period: string }
    >({
      query: ({ symbol, period }) => ({
        url: `/stocks/${symbol}/cache/chart`,
        method: "DELETE",
        params: { period },
      }),
    }),

    evictAllStockCaches: builder.mutation<void, void>({
      query: () => ({
        url: "/stocks/cache/all",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useChangePasswordMutation,

  // Purchase hooks
  useCreatePurchaseMutation,
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useGetPurchasesBySymbolQuery,
  useGetPurchasesByDateRangeQuery,
  useGetRecentPurchasesQuery,
  useGetUserSymbolsQuery,

  // Portfolio/Dashboard hooks
  useGetDashboardQuery,

  // Stock hooks
  useGetStockPriceQuery,
  useGetMultipleStockPricesMutation,
  useGetStockChartQuery,
  useGetStockHistoryQuery,
  useGetLatestStockDataQuery,
  useCheckStockDataExistsQuery,
  useGetAllStockSymbolsQuery,
  useSearchSymbolsQuery,

  // Admin hooks
  useGetStockStatisticsQuery,
  useUpdateStockDataBulkMutation,
  useCleanupOldStockDataMutation,
  useEvictStockPriceCacheMutation,
  useEvictStockChartCacheMutation,
  useEvictAllStockCachesMutation,

  // Lazy query hooks for manual triggering
  useLazyGetPurchaseByIdQuery,
  useLazyGetPurchasesBySymbolQuery,
  useLazyGetStockPriceQuery,
  useLazyGetStockChartQuery,
  useLazySearchSymbolsQuery,
} = stockApi;

// Helper function to handle API errors
export const isApiError = (error: any): error is { data: ApiError } => {
  return error?.data?.error !== undefined;
};

// Utility function to extract error message
export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};
