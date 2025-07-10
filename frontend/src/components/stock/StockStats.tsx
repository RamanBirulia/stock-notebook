import React from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Share,
} from "lucide-react";
import { DashboardStatisticWidget } from "../ui/DashboardStatisticWidget";

interface StockData {
  symbol: string;
  totalQuantity: number;
  totalSpent: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
}

interface StockStatsProps {
  stockData: StockData;
}

export const StockStats: React.FC<StockStatsProps> = ({ stockData }) => {
  const { t } = useTranslation();

  const profitLossPercentage =
    stockData.totalSpent > 0
      ? (stockData.profitLoss / stockData.totalSpent) * 100
      : 0;

  const isProfit = stockData.profitLoss >= 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const stats = [
    {
      id: 1,
      name: t("stock.details.metrics.totalShares"),
      value: formatNumber(stockData.totalQuantity),
      icon: Share,
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      id: 2,
      name: t("stock.details.metrics.currentValue"),
      value: formatCurrency(stockData.currentValue),
      icon: DollarSign,
      iconColor: "text-green-600 dark:text-green-400",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      id: 3,
      name: t("stock.details.metrics.totalInvested"),
      value: formatCurrency(stockData.totalSpent),
      icon: DollarSign,
      iconColor: "text-orange-600 dark:text-orange-400",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      id: 4,
      name: t("stock.details.metrics.profitLoss"),
      value: formatCurrency(stockData.profitLoss),
      icon: isProfit ? TrendingUp : TrendingDown,
      iconColor: isProfit
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400",
      valueColor: isProfit
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400",
      additionalValue: formatPercentage(profitLossPercentage),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.id} className="relative">
          <DashboardStatisticWidget
            id={stat.id}
            name={stat.name}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
            valueColor={stat.valueColor}
            layout="horizontal"
            className="p-6"
          />
          {stat.additionalValue && (
            <div className="absolute bottom-4 right-6">
              <p className={`text-sm ${stat.valueColor}`}>
                {stat.additionalValue}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
