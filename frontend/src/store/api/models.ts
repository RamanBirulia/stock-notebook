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
