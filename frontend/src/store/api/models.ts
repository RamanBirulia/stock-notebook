export interface Purchase {
  id: string;
  symbol: string;
  quantity: number;
  pricePerShare: number;
  commission: number;
  purchaseDate: string;
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
  pricePerShare: number;
  commission: number;
  purchaseDate: string;
}

export interface StockHolding {
  symbol: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  totalSpent: number;
}

export interface DashboardData {
  totalSpent: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  positions: PortfolioPosition[];
}

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currentValue: number;
  totalSpent: number;
  totalCommission: number;
  profitLoss: number;
  profitLossPercentage: number;
  purchaseCount: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

export interface StockDetails {
  symbol: string;
  purchases: Purchase[];
  totalQuantity: number;
  totalSpent: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
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
  priceData: PricePoint[];
  purchasePoints: PurchasePoint[];
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface User {
  id: string;
  username: string;
  lastLogin?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type ChartPeriod = "1M" | "1Y" | "5Y";

export interface UserInfoDTO {
  id: string;
  username: string;
  lastLogin?: string;
}

export interface StockPriceDTO {
  symbol: string;
  price: number;
  lastUpdated: string;
}

export interface PurchaseResponseDTO {
  id: string;
  symbol: string;
  quantity: number;
  pricePerShare: number;
  commission: number;
  purchaseDate: string;
  userId: string;
}

export interface CreatePurchaseRequestDTO {
  symbol: string;
  quantity: number;
  pricePerShare: number;
  commission: number;
  purchaseDate: string;
}

export interface PortfolioSummaryDTO {
  positions: PortfolioPosition[];
  totalValue: number;
  totalSpent: number;
  profitLoss: number;
  profitLossPercentage: number;
  totalPositions: number;
  totalPurchases: number;
  lastUpdated: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
