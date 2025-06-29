import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export interface Purchase {
  id: string;
  symbol: string;
  quantity: number;
  price_per_share: number;
  commission: number;
  purchase_date: string;
}

export interface SymbolSuggestion {
  symbol: string;
  name: string;
  exchange: string;
  asset_type: string;
}

export interface SymbolSearchParams {
  q: string;
  limit?: number;
}

export interface CreatePurchaseRequest {
  symbol: string;
  quantity: number;
  price_per_share: number;
  commission: number;
  purchase_date: string;
}

export interface StockHolding {
  symbol: string;
  quantity: number;
  current_price: number;
  total_value: number;
  total_spent: number;
}

export interface DashboardData {
  total_spent: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  stocks: StockHolding[];
}

export interface StockDetails {
  symbol: string;
  purchases: Purchase[];
  total_quantity: number;
  total_spent: number;
  current_price: number;
  current_value: number;
  profit_loss: number;
}

export interface PricePoint {
  date: string;
  price: number;
  volume?: number;
}

export interface PurchasePoint {
  date: string;
  price: number;
}

export interface ChartData {
  symbol: string;
  period: string;
  price_data: PricePoint[];
  purchase_points: PurchasePoint[];
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface User {
  id: string;
  username: string;
  last_login?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type ChartPeriod = "1M" | "1Y" | "5Y";

export const stockApi = createApi({
  reducerPath: "stockApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
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
  tagTypes: ["Purchase", "Dashboard", "Stock", "Auth"],
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
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    // Purchase endpoints
    createPurchase: builder.mutation<Purchase, CreatePurchaseRequest>({
      query: (purchase) => ({
        url: "/purchases",
        method: "POST",
        body: purchase,
      }),
      invalidatesTags: ["Purchase", "Dashboard", "Stock"],
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
          price_per_share: Number(purchase.price_per_share),
          commission: Number(purchase.commission),
        }));
      },
    }),

    // Dashboard endpoint
    getDashboard: builder.query<DashboardData, void>({
      query: () => "/dashboard",
      providesTags: ["Dashboard"],
      // Transform response to ensure proper number types
      transformResponse: (response: DashboardData) => ({
        ...response,
        total_spent: Number(response.total_spent),
        current_value: Number(response.current_value),
        profit_loss: Number(response.profit_loss),
        profit_loss_percentage: Number(response.profit_loss_percentage),
        stocks: response.stocks.map((stock) => ({
          ...stock,
          quantity: Number(stock.quantity),
          current_price: Number(stock.current_price),
          total_value: Number(stock.total_value),
          total_spent: Number(stock.total_spent),
        })),
      }),
      // Polling for real-time updates (every 30 seconds when focused)
      // Note: pollingInterval should be set when using the hook, not in endpoint definition
    }),

    // Stock details endpoint
    getStock: builder.query<StockDetails, string>({
      query: (symbol) => `/stock/${symbol}`,
      providesTags: (result, error, symbol) => [{ type: "Stock", id: symbol }],
      // Transform response to ensure proper number types
      transformResponse: (response: StockDetails) => ({
        ...response,
        purchases: response.purchases.map((purchase) => ({
          ...purchase,
          price_per_share: Number(purchase.price_per_share),
          commission: Number(purchase.commission),
        })),
        total_quantity: Number(response.total_quantity),
        total_spent: Number(response.total_spent),
        current_price: Number(response.current_price),
        current_value: Number(response.current_value),
        profit_loss: Number(response.profit_loss),
      }),
    }),

    // Chart data endpoint
    getStockChart: builder.query<
      ChartData,
      { symbol: string; period?: ChartPeriod }
    >({
      query: ({ symbol, period = "1M" }) =>
        `/stock/${symbol}/chart?period=${period}`,
      providesTags: (result, error, { symbol, period }) => [
        { type: "Stock", id: `${symbol}-chart-${period}` },
      ],
      // Transform response to ensure proper number types
      transformResponse: (response: ChartData) => ({
        ...response,
        price_data: response.price_data.map((point) => ({
          ...point,
          price: Number(point.price),
          volume: point.volume ? Number(point.volume) : undefined,
        })),
        purchase_points: response.purchase_points.map((point) => ({
          ...point,
          price: Number(point.price),
        })),
      }),
      // Keep chart data cached longer (10 minutes)
      keepUnusedDataFor: 600,
    }),

    // Symbol search endpoint
    searchSymbols: builder.query<SymbolSuggestion[], SymbolSearchParams>({
      query: ({ q, limit = 10 }) => ({
        url: `/symbols/search`,
        params: { q, limit },
      }),
      // Keep search results cached for 5 minutes
      keepUnusedDataFor: 300,
      // Don't cache empty query results
      transformResponse: (response: SymbolSuggestion[], meta, arg) => {
        if (!arg.q.trim()) return [];
        return response;
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useCreatePurchaseMutation,
  useGetPurchasesQuery,
  useGetDashboardQuery,
  useGetStockQuery,
  useGetStockChartQuery,
  useSearchSymbolsQuery,
  // Lazy query hooks for manual triggering
  useLazyGetStockQuery,
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
